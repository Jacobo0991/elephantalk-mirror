import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../schemas/post.schema';
import { CommentPostDto, CreatePostDto, UpdatePostDto } from '../dtos/post.dto';
import { FilterQuery, Model, Types } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { PaginationParamsDto } from 'src/common/dtos/paginationParams.dto';
import { Comment } from '../schemas/comment.schema';
import { ToxicityDetectorService } from 'src/toxicity-detector/services/toxicity-detector.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    private readonly usersService: UsersService,
    private readonly toxicityDetectorService: ToxicityDetectorService,
  ) {}

  async create(id: Types.ObjectId, data: CreatePostDto) {
    const results =
      await this.toxicityDetectorService.getToxicityClassification(
        data.description,
      );

    if (results.isToxic) throw new NotAcceptableException(results.tags);

    const newPost = new this.postModel({ ...data, user: id });
    return await newPost.save();
  }

  async findAll(
    paginationParams: PaginationParamsDto,
    query: FilterQuery<Post> = {},
    userId: Types.ObjectId,
  ) {
    const { favorites } = await this.usersService.findOneById(userId);

    const { limit = 20, page = 1 } = paginationParams;

    const skip = limit * (page - 1);
    const count = await this.postModel.count(query);
    const pages = Math.ceil(count / limit);

    const posts = await this.postModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // sort by createdAt in descending order
      .populate('user', 'username name lastname picture') // select username, name, lastname and picture field
      .populate('likes', 'username name lastname picture'); // select username, name, lastname and picture field

    const postsWithFavoriteAndLikeFlag = posts.map((post) => {
      const isFavorite = favorites.includes(post._id);
      const isLiked = post.likes.some((like) => like._id.equals(userId));
      return { ...post.toObject(), isFavorite, isLiked };
    });

    return {
      data: postsWithFavoriteAndLikeFlag,
      pagination: {
        count,
        page,
        pages,
        limit,
      },
    };
  }

  async findAllFavorites(
    userId: Types.ObjectId,
    paginationParams: PaginationParamsDto,
  ) {
    const { favorites } = await this.usersService.findOneById(userId);

    const { limit = 20, page = 1 } = paginationParams;

    const skip = limit * (page - 1);
    const count = await this.postModel.count({ _id: { $in: favorites } });
    const pages = Math.ceil(count / limit);

    const posts = await this.postModel
      .find({ _id: { $in: favorites }, active: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // sort by createdAt in descending order
      .populate('user', 'username name lastname picture') // select username, name, lastname and picture field
      .populate('likes', 'username name lastname picture'); // select username, name, lastname and picture field

    const postsWithFavoriteAndLikeFlag = posts.map((post) => {
      const isFavorite = favorites.includes(post._id);
      const isLiked = post.likes.some((like) => like._id.equals(userId));
      return { ...post.toObject(), isFavorite, isLiked };
    });

    return {
      data: postsWithFavoriteAndLikeFlag,
      pagination: {
        count,
        page,
        pages,
        limit,
      },
    };
  }

  async findOneById(id: Types.ObjectId, userId: Types.ObjectId) {
    const { favorites } = await this.usersService.findOneById(userId);

    const post = await this.postModel
      .findOne({ _id: id })
      .populate('user', 'username name lastname picture') // select username, name, lastname and picture field
      .populate('likes', 'username name lastname picture') // select username, name, lastname and picture field
      .populate({
        path: 'comments',
        select: 'content user manualReviewed',
        populate: {
          path: 'user',
          select: 'username name lastname picture',
        },
      });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (!post.active && !post.user._id.equals(userId)) {
      throw new NotFoundException('Post not found.');
    }

    const isFavorite = favorites.includes(post._id);
    const isLiked = post.likes.some((like) => like._id.equals(userId));

    return { ...post.toObject(), isFavorite, isLiked };
  }

  async updateOneById(
    id: Types.ObjectId,
    changes: UpdatePostDto,
    userId: Types.ObjectId,
  ) {
    const post = await this.findOneById(id, userId);

    if (!post.user._id.equals(userId)) {
      throw new ForbiddenException('Forbidden to update this post.');
    }

    const results =
      await this.toxicityDetectorService.getToxicityClassification(
        changes.description,
      );

    if (results.isToxic) throw new NotAcceptableException(results.tags);

    const updatedPost = this.postModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            manualReviewed: false,
            ...changes,
          },
        },
        { new: true },
      )
      .select('title description image updatedAt -_id');

    return updatedPost;
  }

  async deleteOneById(id: Types.ObjectId, userId: Types.ObjectId) {
    const post = await this.findOneById(id, userId);

    if (!post.user._id.equals(userId)) {
      throw new ForbiddenException('Forbidden to delete this post.');
    }

    return this.postModel.deleteOne({ _id: id });
  }

  async toggleActive(id: Types.ObjectId, userId: Types.ObjectId) {
    const post = await this.findOneById(id, userId);

    if (!post.user._id.equals(userId)) {
      throw new ForbiddenException('Forbidden to update this post.');
    }

    return this.postModel
      .findByIdAndUpdate(id, { $set: { active: !post.active } }, { new: true })
      .select('active -_id');
  }

  async toggleLike(id: Types.ObjectId, userId: Types.ObjectId) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    let { likes } = post;

    const isLiked = likes.includes(userId);

    if (isLiked) {
      likes = likes.filter((id) => !id.equals(userId));
    } else {
      likes.push(userId);
    }

    return this.postModel
      .findByIdAndUpdate(id, { $set: { likes } }, { new: true })
      .select('likes -_id');
  }

  async addComment(
    id: Types.ObjectId,
    userId: Types.ObjectId,
    comment: CommentPostDto,
  ) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const results =
      await this.toxicityDetectorService.getToxicityClassification(
        comment.content,
      );

    if (results.isToxic) throw new NotAcceptableException(results.tags);

    const newComment = new this.commentModel({
      ...comment,
      post: id,
      user: userId,
    });

    await newComment.save();

    post.comments.push(newComment._id);

    await post.save();

    return newComment;
  }

  async deleteComment(commentId: Types.ObjectId, userId: Types.ObjectId) {
    const comment = await this.commentModel
      .findOne({ _id: commentId })
      .populate('user', '_id')
      .populate('post', '_id');

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    if (!comment.user._id.equals(userId)) {
      throw new ForbiddenException('Forbidden to delete this comment.');
    }

    const post = await this.postModel.findById(comment.post._id);

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    post.comments = post.comments.filter((id) => !id.equals(commentId));

    await post.save();

    return this.commentModel.deleteOne({ _id: commentId });
  }

  async toggleFavorite(userId: Types.ObjectId, postId: Types.ObjectId) {
    await this.findOneById(postId, userId);

    return this.usersService.toggleFavoritePost(userId, postId);
  }
}

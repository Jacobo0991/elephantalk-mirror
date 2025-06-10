import { Module } from '@nestjs/common';
import { PostController } from './controllers/posts.controller';
import { PostService } from './services/posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { UsersModule } from 'src/users/users.module';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { ToxicityDetectorModule } from 'src/toxicity-detector/toxicity-detector.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    UsersModule,
    ToxicityDetectorModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}

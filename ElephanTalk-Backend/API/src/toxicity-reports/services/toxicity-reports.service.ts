import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report } from '../schemas/report.schema';
import { Model, Types } from 'mongoose';
import {
  CreateToxicityReportDto,
  DecideToxicityReportDto,
  GetToxicityReportsQueryDto,
} from '../dtos/toxicityReport.dto';
import { ReportType } from '../models/report-type.model';
import { Post } from 'src/posts/schemas/post.schema';
import { Comment } from 'src/posts/schemas/comment.schema';
import {
  ReportDecideAction,
  ReportStatus,
} from '../models/report-status.model';
import { OrderType } from 'src/common/models/order.model';

@Injectable()
export class ToxicityReportsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}

  async create(data: CreateToxicityReportDto) {
    let userId: Types.ObjectId;
    let content: string;

    // Check if the comment or post has an pending report
    const report = await this.reportModel.findOne({
      reportedElementId: data.reportedElementId,
      status: ReportStatus.PENDING,
    });

    if (report) {
      throw new ConflictException('Report already exists');
    }

    if (data.type === ReportType.COMMENT) {
      const comment = await this.commentModel.findOne({
        _id: data.reportedElementId,
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      userId = comment.user;
      content = comment.content;
    }

    if (data.type === ReportType.POST) {
      const post = await this.postModel.findOne({
        _id: data.reportedElementId,
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      userId = post.user;
      content = post.description;
    }

    const newReport = new this.reportModel({
      ...data,
      content,
      user: userId,
    });

    return await newReport.save();
  }

  async findAll(paginationParams: GetToxicityReportsQueryDto) {
    const {
      limit = 20,
      page = 1,
      order = OrderType.DESC,
      type,
    } = paginationParams;

    const skip = limit * (page - 1);
    const count = await this.reportModel.countDocuments(type ? { type } : {});
    const pages = Math.ceil(count / limit);

    const reports = await this.reportModel
      .find()
      .where(type ? { type } : {})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: order }) // sort by createdAt in descending order
      .populate('user', 'username name lastname picture') // select username, name, lastname and picture field
      .populate('reviewer', 'username name lastname picture'); // select username, name, lastname and picture field

    return {
      reports,
      pagination: {
        count,
        page,
        pages,
        limit,
      },
    };
  }

  async findPending(paginationParams: GetToxicityReportsQueryDto) {
    const {
      limit = 20,
      page = 1,
      order = OrderType.DESC,
      type,
    } = paginationParams;

    const skip = limit * (page - 1);
    const count = await this.reportModel.count({
      status: ReportStatus.PENDING,
      ...(type ? { type } : {}),
    });
    const pages = Math.ceil(count / limit);

    const reports = await this.reportModel
      .find({ status: ReportStatus.PENDING })
      .where(type ? { type } : {})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: order }) // sort by createdAt in descending order
      .populate('user', 'username name lastname picture'); // select username, name, lastname and picture field

    return {
      reports,
      pagination: {
        count,
        page,
        pages,
        limit,
      },
    };
  }

  async findOneById(id: Types.ObjectId) {
    const report = await this.reportModel
      .findOne({ _id: id })
      .populate('user', 'username name lastname picture') // select username, name, lastname and picture field
      .populate('reviewer', 'username name lastname picture'); // select username, name, lastname and picture field

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async decide(
    reportId: Types.ObjectId,
    userId: Types.ObjectId,
    data: DecideToxicityReportDto,
  ) {
    const report = await this.reportModel.findOne({ _id: reportId });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new ConflictException('Report already decided');
    }

    // Delete reported element if the report is accepted as toxic
    if (data.status === ReportDecideAction.ACCEPTED) {
      if (report.type === ReportType.POST) {
        await this.postModel.findByIdAndDelete(report.reportedElementId);
      }

      if (report.type === ReportType.COMMENT) {
        await this.commentModel.findByIdAndDelete(report.reportedElementId);
      }
    }

    // Update reported element status to avoid further reports
    if (report.type === ReportType.POST) {
      await this.postModel.findByIdAndUpdate(report.reportedElementId, {
        $set: { manualReviewed: true },
      });
    }

    if (report.type === ReportType.COMMENT) {
      await this.commentModel.findByIdAndUpdate(report.reportedElementId, {
        $set: { manualReviewed: true },
      });
    }

    // Update report status and reviewer
    return await this.reportModel.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status: data.status,
          reviewer: userId,
          revisionDate: new Date(),
        },
      },
      { new: true },
    );
  }
}

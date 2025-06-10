import { Module } from '@nestjs/common';
import { ToxicityReportsService } from './services/toxicity-reports.service';
import { ToxicityReportsController } from './controllers/toxicity-reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './schemas/report.schema';
import { Post, PostSchema } from 'src/posts/schemas/post.schema';
import { Comment, CommentSchema } from 'src/posts/schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  providers: [ToxicityReportsService],
  controllers: [ToxicityReportsController],
})
export class ToxicityReportsModule {}

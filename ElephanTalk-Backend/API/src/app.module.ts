import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './posts/posts.module';
import { ToxicityReportsModule } from './toxicity-reports/toxicity-reports.module';
import { ToxicityDetectorModule } from './toxicity-detector/toxicity-detector.module';
import appConfig from 'src/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().optional(),
        JWT_SECRET: Joi.string().required(),
        TOXICITY_URL: Joi.string().required(),
        TOXICITY_THRESHOLD: Joi.number().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostModule,
    ToxicityReportsModule,
    ToxicityDetectorModule,
  ],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from 'src/config/app.config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigType<typeof appConfig>) => ({
        uri: configService.mongo.uri,
      }),
      inject: [appConfig.KEY],
    }),
  ],
})
export class DatabaseModule {}

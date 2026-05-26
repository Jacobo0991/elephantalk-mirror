import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { UsersModule } from 'src/users/users.module';
import { ToxicityDetectorModule } from 'src/toxicity-detector/toxicity-detector.module';
import { EventController } from './controller/event.controller';
import { EventService } from './services/event.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
    ]),
    UsersModule,
    ToxicityDetectorModule
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
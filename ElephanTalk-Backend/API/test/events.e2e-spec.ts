import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Event } from '../src/events/schemas/event.schema';
import { User } from '../src/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ToxicityDetectorService } from 'src/toxicity-detector/services/toxicity-detector.service';

let mockUserId = new Types.ObjectId();
let mockOtherUserId = new Types.ObjectId();

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const validEventBody = {
  title: 'Summer Music Festival',
  description: 'A great outdoor music event',
  date: futureDate.toISOString(),
  schedule: {
    startTime: '14:00',
    endTime: '18:00',
  },
  location: { lat: 25.7617, lng: -80.1918 },
  country: 'United States',
  city: 'Miami',
  address: '123 Main St',
  capacity: 100,
};

// Suite
describe('EventController (e2e)', () => {
  let app: INestApplication;
  let eventModel: Model<Event>;
  let userModel: Model<User>;
  let jwtService: JwtService;

  let ownerToken: string;
  let otherToken: string;
  let createdEventId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(ToxicityDetectorService)
    .useValue({
      getToxicityClassification: jest.fn().mockResolvedValue({
        isToxic: false,
        tags: [],
      }),
    })
    .compile();


    app = moduleFixture.createNestApplication();

    // Mirror your main.ts validation pipe setup
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    eventModel = moduleFixture.get<Model<Event>>(getModelToken(Event.name));
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    const ownerUser = await userModel.create({
      username: 'testowner',
      email: 'owner@test.com',
      password: 'hashedpassword',
      name: 'Test',
      lastname: 'Owner',
      picture: 'https://i.pravatar.cc/150?u=testowner',
      role: 'user',
    });

    const otherUser = await userModel.create({
      username: 'testother',
      email: 'other@test.com',
      password: 'hashedpassword',
      name: 'Test',
      lastname: 'Other',
      picture: 'https://i.pravatar.cc/150?u=testother',
      role: 'user',
    });

    mockOtherUserId = otherUser._id;
    mockUserId = ownerUser._id;
    // Generate tokens using the real seeded user IDs
    ownerToken = jwtService.sign({ sub: mockUserId, role: ownerUser.role });
    otherToken = jwtService.sign({ sub: mockOtherUserId, role: otherUser.role });
  });

  afterAll(async () => {
    await eventModel.deleteMany({ title: validEventBody.title });
    await userModel.deleteMany({
      _id: { $in: [mockUserId, mockOtherUserId] },
    });
    await app.close();
  });

  describe('POST /events', () => {
    it('should create an event and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(validEventBody)
        .expect(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe(validEventBody.title);
      createdEventId = res.body.data._id;
    });

    it('should return 400 with missing required fields', async () => {``
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ description: 'Missing title and date' })
        .expect(400);
    });

    it('should return 400 with invalid date format', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ ...validEventBody, date: 'not-a-date' })
        .expect(400);
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .send(validEventBody)
        .expect(401);
    });
  });

  describe('GET /events', () => {
    it('should return paginated active events', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by search term', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .query({ search: 'Summer Music' })
        .expect(200);

      expect(res.body.data.every((e: any) =>
        e.title.includes('Summer') || e.description.includes('Summer'),
      )).toBe(true);
    });

    it('should filter by date range', async () => {
      const dateFrom = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .query({ dateFrom, dateTo })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer()).get('/events').expect(401);
    });
  });

  describe('GET /events/upcoming', () => {
    it('should return only future events', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/upcoming')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const now = new Date();
      expect(
        res.body.data.every((e: any) => new Date(e.date) >= now),
      ).toBe(true);
    });
  });

  describe('GET /events/owned', () => {
    it('should return only events created by the current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/owned')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
      expect(
        res.body.data.every((e: any) => e.user._id === mockUserId.toString()),
      ).toBe(true);
    });
  });

  describe('GET /events/attending', () => {
    it('should return events the user is attending', async () => {
      // Mark attendance first
      await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/attendance`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/events/attending')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /events/:id', () => {
    it('should return an event by id with isAttending flag', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('_id', createdEventId);
      expect(res.body.data).toHaveProperty('isAttending');
    });

    it('should return 404 for a non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/events/${fakeId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should return 400 for an invalid mongo id', async () => {
      await request(app.getHttpServer())
        .get('/events/not-a-valid-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(400);
    });
  });

  describe('PUT /events/:id', () => {
    it('should update event as owner', async () => {
      const res = await request(app.getHttpServer())
        .put(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Updated Title', description: 'Updated description' })
        .expect(200);

      expect(res.body.data.title).toBe('Updated Title');
    });

    it('should return 403 when non-owner tries to update', async () => {
      await request(app.getHttpServer())
        .put(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);
    });

    it('should return 400 with invalid capacity', async () => {
      await request(app.getHttpServer())
        .put(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ capacity: -1 })
        .expect(400);
    });

    it('should return 404 for a non-existent event', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .put(`/events/${fakeId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('PATCH /events/:id/active', () => {
    it('should deactivate an active event', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/active`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data.active).toBe(false);
    });

    it('should reactivate a deactivated event', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/active`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data.active).toBe(true);
    });

    it('should return 403 when non-owner tries to toggle', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/active`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('PATCH /events/:id/attendance', () => {
    it('should mark attendance successfully', async () => {
      // Unmark first to get to a clean state
      await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/attendance`)
        .set('Authorization', `Bearer ${ownerToken}`);

      const res = await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/attendance`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data.attendees).toBeDefined();
    });

    it('should unmark attendance if already attending', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/attendance`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data.attendees).toBeDefined();
    });

    it('should return 403 for a past event', async () => {
      // Create a past event directly in DB
      const pastEvent = await eventModel.create({
        ...validEventBody,
        date: pastDate,
        user: new mongoose.Types.ObjectId(mockUserId.toString()),
      });
      
      await request(app.getHttpServer())
        .patch(`/events/${pastEvent._id}/attendance`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403);

      await eventModel.deleteOne({ _id: pastEvent._id });
    });

    it('should return 403 when event is at capacity', async () => {
      // Create a full event directly in DB
      const fullEvent = await eventModel.create({
        ...validEventBody,
        capacity: 1,
        attendees: [mockOtherUserId], // already full
        user: mockUserId,
      });

      await request(app.getHttpServer())
        .patch(`/events/${fullEvent._id}/attendance`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403);

      await eventModel.deleteOne({ _id: fullEvent._id });
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${createdEventId}/attendance`)
        .expect(401);
    });
  });

  describe('DELETE /events/:id', () => {
    it('should return 403 when non-owner tries to delete', async () => {
      await request(app.getHttpServer())
        .delete(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('should delete event as owner', async () => {
      await request(app.getHttpServer())
        .delete(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
    });

    it('should return 404 after deletion', async () => {
      await request(app.getHttpServer())
        .get(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });
});

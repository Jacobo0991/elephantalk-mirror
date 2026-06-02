import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { EventService } from './event.service';
import { UsersService } from 'src/users/services/users.service';
import { ToxicityDetectorService } from 'src/toxicity-detector/services/toxicity-detector.service';

const mockUserId = new Types.ObjectId();
const mockOtherUserId = new Types.ObjectId();
const mockEventId = new Types.ObjectId();

const mockUser = {
  _id: mockUserId,
  username: 'testuser',
  name: 'Test',
  lastname: 'User',
  picture: 'https://example.com/picture.jpg',
};

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);   // 7 days ago

const mockEvent = {
  _id: mockEventId,
  title: 'Test Event',
  description: 'Test Description',
  date: futureDate,
  schedule: { startTime: '14:00', endTime: '18:00'},
  location: { lat: 25.7617, lng: -80.1918 },
  country: 'United States',
  city: 'Miami',
  address: '123 Main St',
  capacity: 100,
  active: true,
  attendees: [],
  user: mockUser,
  toObject: jest.fn().mockReturnThis(),
};

const mockEventModel = {
  new: jest.fn().mockResolvedValue(mockEvent),
  constructor: jest.fn().mockResolvedValue(mockEvent),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockToxicityDetectorService = {
  getToxicityClassification: jest.fn().mockResolvedValue({
    isToxic: false,
    tags: [],
  }),
};

const mockUsersService = {
  findOneById: jest.fn(),
};

// Suite
describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ToxicityDetectorService,
          useValue: mockToxicityDetectorService
        }
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return an event', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockEvent);
      const constructorMock = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));

      // Replace the model constructor behavior
      (service as any).eventModel = Object.assign(constructorMock, mockEventModel);

      const dto = {
        title: 'Test Event',
        description: 'Test Description',
        date: futureDate,
        schedule: { startTime: '14:00', endTime: '18:00' },
      };

      const result = await service.create(mockUserId, dto as any);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const events = [mockEvent];
      mockEventModel.countDocuments.mockResolvedValue(1);

      // Make populate chainable and resolve
      const chainMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn(),
      };
      // Final populate resolves to events array
      let populateCount = 0;
      chainMock.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve(events);
        return chainMock;
      });
      mockEventModel.find.mockReturnValue(chainMock);

      const result = await service.findAll(
        { page: 1, limit: 20 },
        {},
        mockUserId,
      );

      expect(result.pagination.count).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should apply search filter', async () => {
      mockEventModel.countDocuments.mockResolvedValue(0);
      const chainMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn(),
      };
      
      // Final populate resolves to events array
      let populateCount = 0;
      chainMock.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([]);
        return chainMock;
      });
      mockEventModel.find.mockReturnValue(chainMock);

      await service.findAll({ page: 1, limit: 20 }, { search: 'festival' }, mockUserId);

      expect(mockEventModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { title: { $regex: 'festival', $options: 'i' } },
            { description: { $regex: 'festival', $options: 'i' } },
          ],
        }),
      );
    });

    it('should apply date range filter', async () => {
      const dateFrom = new Date('2026-08-01');
      const dateTo = new Date('2026-08-31');

      mockEventModel.countDocuments.mockResolvedValue(0);
      const chainMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn(),
      };
      // Final populate resolves to events array
      let populateCount = 0;
      chainMock.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([]);
        return chainMock;
      });
      mockEventModel.find.mockReturnValue(chainMock);

      await service.findAll({ page: 1, limit: 20 }, { dateFrom, dateTo }, mockUserId);

      expect(mockEventModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: { $gte: dateFrom, $lte: dateTo },
        }),
      );
    });
  });

  describe('findOneById', () => {
    it('should return event with isAttending flag', async () => {
      const eventWithAttendee = {
        ...mockEvent,
        attendees: [{ _id: mockUserId, equals: (id: any) => id.equals(mockUserId) }],
        toObject: jest.fn().mockReturnValue({ ...mockEvent, attendees: [] }),
      };

      mockEventModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve: any) => Promise.resolve(resolve(eventWithAttendee)),
      });

      const chainMock = {
        populate: jest.fn().mockReturnThis(),
      };
      let populateCount = 0;
      chainMock.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve(eventWithAttendee);
        return chainMock;
      });
      mockEventModel.findOne.mockReturnValue(chainMock);

      const result = await service.findOneById(mockEventId, mockUserId);
      expect(result).toHaveProperty('isAttending');
    });

    it('should throw NotFoundException if event does not exist', async () => {
      const chainMock = { populate: jest.fn().mockReturnThis() };
      let populateCount = 0;
      chainMock.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve(null);
        return chainMock;
      });
      mockEventModel.findOne.mockReturnValue(chainMock);

      await expect(service.findOneById(mockEventId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOneById', () => {
    it('should update event if user is the owner', async () => {
      // findOneById spy
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent,
        user: { _id: { equals: (id: any) => id.toString() === mockUserId.toString() } },
        isAttending: false,
      } as any);

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ title: 'Updated' }),
      });

      const result = await service.updateOneById(
        mockEventId,
        { title: 'Updated' },
        mockUserId,
      );

      expect(result).toEqual({ title: 'Updated' });
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent,
        user: { _id: { equals: () => false } },
        isAttending: false,
      } as any);

      await expect(
        service.updateOneById(mockEventId, { title: 'Updated' }, mockOtherUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteOneById', () => {
    it('should delete event if user is the owner', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent,
        user: { _id: { equals: () => true } },
        isAttending: false,
      } as any);

      mockEventModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteOneById(mockEventId, mockUserId);
      expect(result).toEqual({ deletedCount: 1 });
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent,
        user: { _id: { equals: () => false } },
        isAttending: false,
      } as any);

      await expect(
        service.deleteOneById(mockEventId, mockOtherUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleActive', () => {
    it('should deactivate an active event', async () => {
      mockEventModel.findById.mockResolvedValue({
        ...mockEvent,
        active: true,
        user: mockUserId,
      });

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ active: false }),
      });

      const result = await service.toggleActive(mockEventId, mockUserId);
      expect(result).toEqual({ active: false });
    });

    it('should reactivate an inactive event', async () => {
      mockEventModel.findById.mockResolvedValue({
        ...mockEvent,
        active: false,
        user: mockUserId,
      });

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ active: true }),
      });

      const result = await service.toggleActive(mockEventId, mockUserId);
      expect(result).toEqual({ active: true });
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockEventModel.findById.mockResolvedValue({
        ...mockEvent,
        user: mockOtherUserId,
      });

      await expect(
        service.toggleActive(mockEventId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleAttendance', () => {
    it('should add user to attendees if not attending', async () => {
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ attendees: [mockUserId] }),
      });

      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent
      } as any);

      const result = await service.toggleAttendance(mockEventId, mockUserId);
      expect(result).toHaveProperty('attendees');
    });

    it('should remove user from attendees if already attending', async () => {

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ attendees: [] }),
      });

      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent
      } as any);

      const result = await service.toggleAttendance(mockEventId, mockUserId);
      expect(result).toHaveProperty('attendees');
    });

    it('should throw NotFoundException if event does not exist', async () => {

      jest.spyOn(service, 'findOneById').mockResolvedValue(null);

      await expect(
        service.toggleAttendance(mockEventId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if event is in the past', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent,
        date: pastDate,
        attendees: [],
      } as any);

      await expect(
        service.toggleAttendance(mockEventId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if event is at capacity', async () => {
      const fullAttendees = Array.from({ length: 5 }, () => new Types.ObjectId());
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        ...mockEvent,
        date: futureDate,
        capacity: 5,
        attendees: fullAttendees,
      } as any);

      await expect(
        service.toggleAttendance(mockEventId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findUpcoming', () => {
    it('should return only future events', async () => {
      mockEventModel.countDocuments.mockResolvedValue(1);
      const chainMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([mockEvent]),
      };
      mockEventModel.find.mockReturnValue(chainMock);

      const result = await service.findUpcoming({ page: 1, limit: 20 });

      expect(mockEventModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.objectContaining({ $gte: expect.any(Date) }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findAttending', () => {
    it('should return events where user is in attendees', async () => {
      mockEventModel.countDocuments.mockResolvedValue(1);
      const chainMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };
      let populateCount = 0;
      chainMock.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([{ ...mockEvent, toObject: () => mockEvent }]);
        return chainMock;
      });
      mockEventModel.find.mockReturnValue(chainMock);

      const result = await service.findAttending(mockUserId, { page: 1, limit: 20 });

      expect(mockEventModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ attendees: mockUserId }),
      );
      expect(result.pagination.count).toBe(1);
    });
  });
});

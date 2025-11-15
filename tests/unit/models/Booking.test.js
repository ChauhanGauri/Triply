const Booking = require('../../../src/models/Booking');
const User = require('../../../src/models/User');
const Schedule = require('../../../src/models/Schedule');
const Route = require('../../../src/models/Route');

describe('Booking Model', () => {
  let testUser, testRoute, testSchedule;

  beforeEach(async () => {
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123'
    });
    await testUser.save();

    testRoute = new Route({
      routeNumber: 'R001',
      origin: 'City A',
      destination: 'City B',
      distance: 100,
      duration: 120,
      fare: 500
    });
    await testRoute.save();

    testSchedule = new Schedule({
      route: testRoute._id,
      journeyDate: new Date('2024-12-25'),
      departureTime: '10:00',
      arrivalTime: '12:00',
      busNumber: 'BUS001',
      capacity: 40,
      availableSeats: 40
    });
    await testSchedule.save();
  });

  describe('Schema Validation', () => {
    it('should create a booking with valid data', async () => {
      const bookingData = {
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 2,
        status: 'confirmed',
        passengers: [
          { name: 'John Doe', age: 30, gender: 'Male' },
          { name: 'Jane Doe', age: 28, gender: 'Female' }
        ],
        totalPrice: 1000,
        paymentMethod: 'card',
        paymentStatus: 'completed'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.user.toString()).toBe(testUser._id.toString());
      expect(savedBooking.schedule.toString()).toBe(testSchedule._id.toString());
      expect(savedBooking.seats).toBe(2);
      expect(savedBooking.status).toBe('confirmed');
      expect(savedBooking.passengers).toHaveLength(2);
      expect(savedBooking.totalPrice).toBe(1000);
      expect(savedBooking.paymentMethod).toBe('card');
      expect(savedBooking.paymentStatus).toBe('completed');
    });

    it('should require user field', async () => {
      const booking = new Booking({
        schedule: testSchedule._id,
        seats: 2
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should require schedule field', async () => {
      const booking = new Booking({
        user: testUser._id,
        seats: 2
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should require seats field', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should default status to "confirmed"', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 2
      });

      const savedBooking = await booking.save();
      expect(savedBooking.status).toBe('confirmed');
    });

    it('should default paymentStatus to "pending"', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 2
      });

      const savedBooking = await booking.save();
      expect(savedBooking.paymentStatus).toBe('pending');
    });

    it('should only allow "confirmed" or "cancelled" as status', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 2,
        status: 'invalid'
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should only allow valid payment methods', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 2,
        paymentMethod: 'invalid'
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should only allow valid payment statuses', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 2,
        paymentStatus: 'invalid'
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should validate passenger schema', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 1,
        passengers: [
          { name: 'John Doe', age: 30 } // Missing gender
        ]
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should allow valid passenger gender values', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 3,
        passengers: [
          { name: 'John Doe', age: 30, gender: 'Male' },
          { name: 'Jane Doe', age: 28, gender: 'Female' },
          { name: 'Alex Doe', age: 25, gender: 'Other' }
        ]
      });

      const savedBooking = await booking.save();
      expect(savedBooking.passengers).toHaveLength(3);
    });

    it('should allow optional bookingReference', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 1,
        bookingReference: 'BOOK123456'
      });

      const savedBooking = await booking.save();
      expect(savedBooking.bookingReference).toBe('BOOK123456');
    });

    it('should allow optional contactPhone', async () => {
      const booking = new Booking({
        user: testUser._id,
        schedule: testSchedule._id,
        seats: 1,
        contactPhone: '9876543210'
      });

      const savedBooking = await booking.save();
      expect(savedBooking.contactPhone).toBe('9876543210');
    });
  });
});


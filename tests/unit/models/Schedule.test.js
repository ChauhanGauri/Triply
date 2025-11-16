const Schedule = require('../../../src/models/Schedule');
const Route = require('../../../src/models/Route');
const mongoose = require('mongoose');

describe('Schedule Model', () => {
  let testRoute;

  beforeEach(async () => {
    testRoute = new Route({
      routeNumber: 'R001',
      origin: 'City A',
      destination: 'City B',
      distance: 100,
      duration: 120,
      fare: 500
    });
    await testRoute.save();
  });

  describe('Schema Validation', () => {
    it('should create a schedule with valid data', async () => {
      const scheduleData = {
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001',
        capacity: 40,
        availableSeats: 40
      };

      const schedule = new Schedule(scheduleData);
      const savedSchedule = await schedule.save();

      expect(savedSchedule._id).toBeDefined();
      expect(savedSchedule.scheduleId).toBeDefined();
      expect(savedSchedule.route.toString()).toBe(testRoute._id.toString());
      expect(savedSchedule.journeyDate).toEqual(scheduleData.journeyDate);
      expect(savedSchedule.departureTime).toBe(scheduleData.departureTime);
      expect(savedSchedule.arrivalTime).toBe(scheduleData.arrivalTime);
      expect(savedSchedule.busNumber).toBe(scheduleData.busNumber);
      expect(savedSchedule.capacity).toBe(40);
      expect(savedSchedule.availableSeats).toBe(40);
      expect(savedSchedule.isActive).toBe(true);
    });

    it('should require route field', async () => {
      const schedule = new Schedule({
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      await expect(schedule.save()).rejects.toThrow();
    });

    it('should require journeyDate field', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      await expect(schedule.save()).rejects.toThrow();
    });

    it('should require departureTime field', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      await expect(schedule.save()).rejects.toThrow();
    });

    it('should require arrivalTime field', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        busNumber: 'BUS001'
      });

      await expect(schedule.save()).rejects.toThrow();
    });

    it('should require busNumber field', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00'
      });

      await expect(schedule.save()).rejects.toThrow();
    });

    it('should default capacity to 40', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      const savedSchedule = await schedule.save();
      expect(savedSchedule.capacity).toBe(40);
    });

    it('should default availableSeats to 40', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      const savedSchedule = await schedule.save();
      expect(savedSchedule.availableSeats).toBe(40);
    });

    it('should default isActive to true', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      const savedSchedule = await schedule.save();
      expect(savedSchedule.isActive).toBe(true);
    });

    it('should allow optional driverName field', async () => {
      const schedule = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001',
        driverName: 'John Doe'
      });

      const savedSchedule = await schedule.save();
      expect(savedSchedule.driverName).toBe('John Doe');
    });
  });

  describe('scheduleId Generation', () => {
    it('should auto-generate unique scheduleId', async () => {
      const schedule1 = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      const schedule2 = new Schedule({
        route: testRoute._id,
        journeyDate: new Date('2024-12-26'),
        departureTime: '11:00',
        arrivalTime: '13:00',
        busNumber: 'BUS002'
      });

      const savedSchedule1 = await schedule1.save();
      const savedSchedule2 = await schedule2.save();

      expect(savedSchedule1.scheduleId).toBeDefined();
      expect(savedSchedule2.scheduleId).toBeDefined();
      expect(savedSchedule1.scheduleId).not.toBe(savedSchedule2.scheduleId);
      expect(savedSchedule1.scheduleId).toMatch(/^SCH/);
    });

    it('should use provided scheduleId if given', async () => {
      const customScheduleId = 'SCHCUSTOM123';
      const schedule = new Schedule({
        route: testRoute._id,
        scheduleId: customScheduleId,
        journeyDate: new Date('2024-12-25'),
        departureTime: '10:00',
        arrivalTime: '12:00',
        busNumber: 'BUS001'
      });

      const savedSchedule = await schedule.save();
      expect(savedSchedule.scheduleId).toBe(customScheduleId);
    });
  });
});


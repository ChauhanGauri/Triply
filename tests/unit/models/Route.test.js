const Route = require('../../../src/models/Route');

describe('Route Model', () => {
  describe('Schema Validation', () => {
    it('should create a route with valid data', async () => {
      const routeData = {
        routeNumber: 'R001',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500
      };

      const route = new Route(routeData);
      const savedRoute = await route.save();

      expect(savedRoute._id).toBeDefined();
      expect(savedRoute.routeNumber).toBe(routeData.routeNumber);
      expect(savedRoute.origin).toBe(routeData.origin);
      expect(savedRoute.destination).toBe(routeData.destination);
      expect(savedRoute.distance).toBe(routeData.distance);
      expect(savedRoute.duration).toBe(routeData.duration);
      expect(savedRoute.fare).toBe(routeData.fare);
      expect(savedRoute.isActive).toBe(true);
    });

    it('should require routeNumber field', async () => {
      const route = new Route({
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500
      });

      await expect(route.save()).rejects.toThrow();
    });

    it('should require origin field', async () => {
      const route = new Route({
        routeNumber: 'R001',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500
      });

      await expect(route.save()).rejects.toThrow();
    });

    it('should require destination field', async () => {
      const route = new Route({
        routeNumber: 'R001',
        origin: 'City A',
        distance: 100,
        duration: 120,
        fare: 500
      });

      await expect(route.save()).rejects.toThrow();
    });

    it('should require distance field', async () => {
      const route = new Route({
        routeNumber: 'R001',
        origin: 'City A',
        destination: 'City B',
        duration: 120,
        fare: 500
      });

      await expect(route.save()).rejects.toThrow();
    });

    it('should require duration field', async () => {
      const route = new Route({
        routeNumber: 'R001',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        fare: 500
      });

      await expect(route.save()).rejects.toThrow();
    });

    it('should require fare field', async () => {
      const route = new Route({
        routeNumber: 'R001',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120
      });

      await expect(route.save()).rejects.toThrow();
    });

    it('should enforce unique routeNumber', async () => {
      const routeData = {
        routeNumber: 'R001',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500
      };

      await new Route(routeData).save();

      const duplicateRoute = new Route(routeData);
      await expect(duplicateRoute.save()).rejects.toThrow();
    });

    it('should default isActive to true', async () => {
      const route = new Route({
        routeNumber: 'R002',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500
      });

      const savedRoute = await route.save();
      expect(savedRoute.isActive).toBe(true);
    });

    it('should allow stops array', async () => {
      const route = new Route({
        routeNumber: 'R003',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500,
        stops: ['Stop 1', 'Stop 2', 'Stop 3']
      });

      const savedRoute = await route.save();
      expect(savedRoute.stops).toHaveLength(3);
      expect(savedRoute.stops).toContain('Stop 1');
    });

    it('should allow optional description field', async () => {
      const route = new Route({
        routeNumber: 'R004',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        duration: 120,
        fare: 500,
        description: 'Express route'
      });

      const savedRoute = await route.save();
      expect(savedRoute.description).toBe('Express route');
    });
  });
});


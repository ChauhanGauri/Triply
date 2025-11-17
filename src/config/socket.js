const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedisClient } = require('./redis');

let ioInstance = null;
let sessionMiddleware = null;

function initSocket(server, expressSessionMiddleware) {
  if (ioInstance) return ioInstance;

  // Store session middleware for authentication
  sessionMiddleware = expressSessionMiddleware;

  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      credentials: true
    }
  });

  // Socket.io session authentication middleware
  if (sessionMiddleware) {
    ioInstance.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });
  }

  // Use Redis adapter for scaling across multiple servers
  (async () => {
    try {
      // Wait a bit to ensure Redis is connected
      await new Promise(resolve => setTimeout(resolve, 1500));
      const client = getRedisClient();
      if (client && client.isReady) {
        const pubClient = client.duplicate();
        const subClient = client.duplicate();
        
        await pubClient.connect();
        await subClient.connect();
        ioInstance.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.io Redis adapter initialized');
      }
    } catch (error) {
      console.warn('⚠️ Socket.io Redis adapter not available, using default adapter:', error.message);
    }
  })();

  ioInstance.on('connection', (socket) => {
    const session = socket.request.session;
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.log('🔴 Unauthorized socket connection attempt:', socket.id);
      socket.emit('unauthorized', { message: 'Please log in to connect' });
      socket.disconnect(true);
      return;
    }

    const user = session.user;
    console.log(`🟢 Socket connected: ${socket.id} | User: ${user.name} (${user.role})`);

    // Store user info on socket for later use
    socket.user = user;

    // Auto-join user to their role-specific room
    if (user.role === 'admin') {
      socket.join('admins');
      console.log(`   ✓ Admin ${user.name} joined 'admins' room`);
    } else if (user.role === 'user') {
      const userRoom = `user_${user.id}`;
      socket.join(userRoom);
      console.log(`   ✓ User ${user.name} joined '${userRoom}' room`);
    }

    // Optional: Allow joining additional rooms with validation
    socket.on('joinRoom', (room) => {
      try {
        // Validate room access based on user role
        if (user.role === 'admin') {
          // Admins can join any room
          socket.join(room);
          console.log(`   ✓ Admin joined room: ${room}`);
        } else if (user.role === 'user') {
          // Users can only join their own user room or public rooms
          const userRoom = `user_${user.id}`;
          if (room === userRoom || room.startsWith('public_')) {
            socket.join(room);
            console.log(`   ✓ User joined room: ${room}`);
          } else {
            console.log(`   ✗ User denied access to room: ${room}`);
            socket.emit('roomAccessDenied', { room });
          }
        }
      } catch (err) {
        console.warn('Error joining room', err);
      }
    });

    // Handle joining schedule-specific rooms for seat updates
    socket.on('joinSchedule', (scheduleId) => {
      try {
        const scheduleRoom = `schedule_${scheduleId}`;
        socket.join(scheduleRoom);
        console.log(`   ✓ User ${user.name} joined schedule room: ${scheduleRoom}`);
      } catch (err) {
        console.warn('Error joining schedule room', err);
      }
    });

    socket.on('leaveSchedule', (scheduleId) => {
      try {
        const scheduleRoom = `schedule_${scheduleId}`;
        socket.leave(scheduleRoom);
        console.log(`   ✓ User ${user.name} left schedule room: ${scheduleRoom}`);
      } catch (err) {
        console.warn('Error leaving schedule room', err);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔴 Socket disconnected: ${socket.id} | User: ${user.name}`);
    });

    // Emit successful connection event
    socket.emit('authenticated', { 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      } 
    });
  });

  return ioInstance;
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  return ioInstance;
}

module.exports = { initSocket, getIo };

const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedisClient } = require('./redis');

let ioInstance = null;

function initSocket(server) {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(server, {
    cors: {
      origin: '*'
    }
  });

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
    console.log('🟢 Socket connected:', socket.id);

    socket.on('joinRoom', (room) => {
      try {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      } catch (err) {
        console.warn('Error joining room', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected:', socket.id);
    });
  });

  return ioInstance;
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  return ioInstance;
}

module.exports = { initSocket, getIo };

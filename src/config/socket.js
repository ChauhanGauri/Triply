const { Server } = require('socket.io');

let ioInstance = null;

function initSocket(server) {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(server, {
    cors: {
      origin: '*'
    }
  });

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

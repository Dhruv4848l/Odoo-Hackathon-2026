const activeSockets = new Map(); // Maps userId -> socketId

let ioInstance = null;

const socketHandler = (io) => {
  ioInstance = io;
  
  io.on('connection', (socket) => {
    console.log(`[SOCKET] Connection established: ${socket.id}`);
    
    // Authenticate and register user
    socket.on('register', (userId) => {
      if (userId) {
        activeSockets.set(userId.toString(), socket.id);
        socket.userId = userId.toString();
        console.log(`[SOCKET] Registered user: ${userId} to socket: ${socket.id}`);
      }
    });
    
    socket.on('disconnect', () => {
      if (socket.userId) {
        activeSockets.delete(socket.userId);
        console.log(`[SOCKET] User disconnected: ${socket.userId}`);
      } else {
        console.log(`[SOCKET] Unregistered socket disconnected: ${socket.id}`);
      }
    });
  });
};

// Helper function to send real-time socket events
const sendToUser = (userId, eventName, data) => {
  if (!ioInstance) return false;
  
  const socketId = activeSockets.get(userId.toString());
  if (socketId) {
    ioInstance.to(socketId).emit(eventName, data);
    console.log(`[SOCKET] Sent event '${eventName}' to User ${userId}`);
    return true;
  }
  
  console.log(`[SOCKET] User ${userId} is offline. Socket event '${eventName}' buffered/skipped.`);
  return false;
};

module.exports = socketHandler;
module.exports.activeSockets = activeSockets;
module.exports.sendToUser = sendToUser;

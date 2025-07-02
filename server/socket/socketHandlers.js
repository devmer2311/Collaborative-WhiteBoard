import Room from '../models/Room.js';

const rooms = new Map(); // Store active rooms and users

export const handleSocketConnection = (socket, io) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId) => {
    try {
      socket.join(roomId);
      socket.roomId = roomId;

      // Add user to room tracking
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // Load existing drawing data
      const room = await Room.findOne({ roomId });
      if (room && room.drawingData.length > 0) {
        socket.emit('load-drawing', room.drawingData.map(cmd => cmd.data));
      }

      // Send updated user list to all users in room
      const userList = Array.from(rooms.get(roomId));
      io.to(roomId).emit('room-users', userList);

      console.log(`User ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('draw-start', async (data) => {
    const { roomId, x, y, color, strokeWidth } = data;
    
    // Broadcast to other users in the room
    socket.to(roomId).emit('draw-start', { x, y, color, strokeWidth });

    // Start new stroke data
    socket.currentStroke = {
      type: 'stroke',
      path: [{ x, y }],
      color,
      strokeWidth,
      timestamp: new Date()
    };
  });

  socket.on('draw-move', (data) => {
    const { roomId, x, y } = data;
    
    // Broadcast to other users in the room
    socket.to(roomId).emit('draw-move', { x, y });

    // Add point to current stroke
    if (socket.currentStroke) {
      socket.currentStroke.path.push({ x, y });
    }
  });

  socket.on('draw-end', async (data) => {
    const { roomId } = data;
    
    socket.to(roomId).emit('draw-end');

    // Save completed stroke to database
    if (socket.currentStroke && socket.currentStroke.path.length > 1) {
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { 
            $push: { 
              drawingData: {
                type: socket.currentStroke.type,
                data: socket.currentStroke,
                timestamp: socket.currentStroke.timestamp
              }
            }
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error saving stroke:', error);
      }
    }

    socket.currentStroke = null;
  });

  socket.on('clear-canvas', async (data) => {
    const { roomId } = data;
    
    // Broadcast to all users in the room
    io.to(roomId).emit('clear-canvas');

    // Save clear command to database
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { 
          $push: { 
            drawingData: {
              type: 'clear',
              data: { type: 'clear' },
              timestamp: new Date()
            }
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error saving clear command:', error);
    }
  });

  socket.on('cursor-move', (data) => {
    const { roomId, position } = data;
    socket.to(roomId).emit('cursor-move', { userId: socket.id, position });
  });

  socket.on('leave-room', (roomId) => {
    handleUserLeave(socket, roomId, io);
  });

  socket.on('disconnect', () => {
    handleUserLeave(socket, socket.roomId, io);
    console.log('User disconnected:', socket.id);
  });
};

const handleUserLeave = (socket, roomId, io) => {
  if (!roomId) return;

  socket.leave(roomId);
  
  // Remove user from room tracking
  if (rooms.has(roomId)) {
    rooms.get(roomId).delete(socket.id);
    
    // If room is empty, remove it
    if (rooms.get(roomId).size === 0) {
      rooms.delete(roomId);
    } else {
      // Send updated user list to remaining users
      const userList = Array.from(rooms.get(roomId));
      io.to(roomId).emit('room-users', userList);
      io.to(roomId).emit('user-left', socket.id);
    }
  }
};
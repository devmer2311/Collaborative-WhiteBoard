import mongoose from 'mongoose';

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['stroke', 'clear'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  drawingData: [drawingCommandSchema]
});

// Update lastActivity on save
roomSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Auto-delete rooms older than 24 hours
roomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('Room', roomSchema);
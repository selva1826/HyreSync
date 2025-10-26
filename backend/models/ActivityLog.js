import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  actor: {
    type: {
      type: String,
      enum: ['applicant', 'admin', 'bot_mimic'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  },
  
  action: {
    type: String,
    required: true
  },
  
  details: {
    fromStatus: String,
    toStatus: String,
    comment: String,
    score: Number,
    reasoning: String
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

// Index for faster timeline queries
activityLogSchema.index({ applicationId: 1, timestamp: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);

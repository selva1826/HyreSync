import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    default: 'Applied'
  },
  
  currentStage: {
    name: { type: String, default: 'Applied' },
    order: { type: Number, default: 1 },
    enteredAt: { type: Date, default: Date.now }
  },
  
  // 🤖 BOT MIMIC EVALUATION DATA
  evaluation: {
    isProcessed: { type: Boolean, default: false },
    processedAt: Date,
    score: { type: Number, default: 0 },
    breakdown: {
      skillsScore: Number,
      experienceScore: Number,
      educationScore: Number,
      certificationsScore: Number
    },
    decision: {
      type: String,
      enum: ['passed', 'rejected', 'pending'],
      default: 'pending'
    },
    reasoning: String,
    confidence: Number
  },
  
  // Resume file info
  resume: {
    filename: { type: String, required: true },
    originalName: String,
    path: { type: String, required: true },
    mimetype: String,
    size: Number
  },
  
  // Extracted text (stored after parsing)
  resumeText: String,
  
  parsedData: {
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: Number,
      startDate: Date,
      endDate: Date
    }],
    education: [String],
    certifications: [String],
    totalExperience: Number
  },
  
  coverLetter: String,
  rejectionReason: String
  
}, { timestamps: true });

// Index for faster queries
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ applicantId: 1 });

export default mongoose.model('Application', applicationSchema);

import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'non-technical'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published'
  },
  description: {
    type: String,
    required: true
  },
  location: String,
  
  requirements: {
    skills: [String],
    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 20 }
    },
    education: [String],
    certifications: [String],
    
    // 🧠 SCORING CONFIGURATION (Bot Mimic uses this)
    weights: {
      skillsMatch: { type: Number, default: 40 },
      experienceMatch: { type: Number, default: 30 },
      educationMatch: { type: Number, default: 20 },
      certificationsMatch: { type: Number, default: 10 }
    },
    
    passingScore: { type: Number, default: 70 }
  },
  
  workflow: {
    stages: {
      type: [{
        name: { type: String, required: true },
        order: { type: Number, required: true },
        automatable: { type: Boolean, default: false }
      }],
      default: function() {
        return [
          { name: 'Applied', order: 1, automatable: false },
          { name: 'Screening', order: 2, automatable: true },
          { name: 'Reviewed', order: 3, automatable: false },
          { name: 'Interview', order: 4, automatable: false },
          { name: 'Offer', order: 5, automatable: false },
          { name: 'Rejected', order: 99, automatable: false }
        ];
      }
    }
  },
  
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);

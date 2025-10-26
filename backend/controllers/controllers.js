import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateToken } from '../utils/helpers.js';
import botMimicWorker from '../services/botMimicWorker.js';
import fileParser from '../services/fileParser.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH CONTROLLERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create applicant user
    const user = await User.create({
      email,
      password,
      role: 'applicant',
      profile: { firstName, lastName, phone }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isSuperAdmin: user.isSuperAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isSuperAdmin: user.isSuperAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👔 JOB CONTROLLERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    else filter.status = 'published';

    const jobs = await Job.find(filter)
      .populate('postedBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'profile.firstName profile.lastName');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📄 APPLICATION CONTROLLERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const submitApplication = async (req, res) => {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 APPLICATION SUBMISSION REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔹 Body:', req.body);
    console.log('🔹 File:', req.file);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Handle undefined body (Multer issue)
    if (!req.body) {
      req.body = {};
    }
    
    const jobId = req.body.jobId;
    const coverLetter = req.body.coverLetter || '';
    
    if (!req.file) {
      console.error('❌ NO FILE RECEIVED! Multer did not process the file.');
      return res.status(400).json({ 
        error: 'Resume file is required',
        debug: {
          hasBody: !!req.body,
          hasFile: !!req.file,
          contentType: req.headers['content-type']
        }
      });
    }

    console.log('✅ File received:', req.file.originalname);
    console.log('✅ Job ID:', jobId);

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'published') {
      return res.status(400).json({ error: 'Job not available' });
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      jobId,
      applicantId: req.user._id
    });
    
    if (existingApp) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Extract text from uploaded file
    console.log('📄 Extracting text from:', req.file.originalname);
    const resumeText = await fileParser.extractText(req.file.path);
    console.log('✅ Text extracted, length:', resumeText.length);

    // Create application
    const application = await Application.create({
      jobId,
      applicantId: req.user._id,
      resume: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      resumeText,
      coverLetter,
      status: 'Applied',
      currentStage: {
        name: 'Applied',
        order: 1,
        enteredAt: new Date()
      }
    });

    // Create activity log
    await ActivityLog.create({
      applicationId: application._id,
      actor: {
        type: 'applicant',
        id: req.user._id,
        name: `${req.user.profile.firstName} ${req.user.profile.lastName}`
      },
      action: 'application_submitted',
      details: {
        toStatus: 'Applied'
      }
    });

    console.log(`✅ Application created: ${application._id}\n`);

    res.status(201).json({
      message: 'Application submitted successfully! Bot Mimic will process it soon.',
      application
    });
  } catch (error) {
    console.error('❌ Application submission error:', error);
    res.status(500).json({ error: error.message });
  }
};



export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user._id })
      .populate('jobId', 'title department location type')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('applicantId', 'email profile');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Authorization check
    if (req.user.role === 'applicant' && 
        application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get activity timeline
    const timeline = await ActivityLog.find({ applicationId: application._id })
      .sort({ timestamp: 1 });

    res.json({ application, timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { jobId, status, type } = req.query;
    const filter = {};

    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;

    let query = Application.find(filter)
      .populate('jobId', 'title department type')
      .populate('applicantId', 'email profile')
      .sort({ createdAt: -1 });

    if (type) {
      const jobs = await Job.find({ type }).select('_id');
      const jobIds = jobs.map(j => j._id);
      filter.jobId = { $in: jobIds };
      query = Application.find(filter)
        .populate('jobId', 'title department type')
        .populate('applicantId', 'email profile')
        .sort({ createdAt: -1 });
    }

    const applications = await query;

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const oldStatus = application.status;
    application.status = status;

    const workflow = application.jobId.workflow.stages;
    const newStage = workflow.find(s => s.name === status);
    if (newStage) {
      application.currentStage = {
        name: newStage.name,
        order: newStage.order,
        enteredAt: new Date()
      };
    }

    if (status === 'Rejected') {
      application.rejectionReason = comment || 'Rejected by admin';
    }

    await application.save();

    await ActivityLog.create({
      applicationId: application._id,
      actor: {
        type: 'admin',
        id: req.user._id,
        name: `${req.user.profile.firstName} ${req.user.profile.lastName}`
      },
      action: 'status_changed',
      details: {
        fromStatus: oldStatus,
        toStatus: status,
        comment
      }
    });

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👨‍💼 ADMIN CONTROLLERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createAdmin = async (req, res) => {
  try {
    // Check if requester is super admin
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only super admin can create new admins' });
    }

    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Regular admin (NOT super admin)
    const admin = await User.create({
      email,
      password,
      role: 'admin',
      profile: { firstName, lastName },
      createdBy: req.user._id,
      isSuperAdmin: false
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        profile: admin.profile,
        isSuperAdmin: admin.isSuperAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: 'published' });
    const totalApplications = await Application.countDocuments();
    const pendingReview = await Application.countDocuments({ status: 'Reviewed' });
    const interviews = await Application.countDocuments({ status: 'Interview' });

    const recentApplications = await Application.find()
      .populate('jobId', 'title type')
      .populate('applicantId', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    const botStats = botMimicWorker.getStats();

    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: {
        totalJobs,
        totalApplications,
        pendingReview,
        interviews,
        botProcessed: botStats.totalProcessed
      },
      recentApplications,
      applicationsByStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ANALYTICS CONTROLLERS (NEW)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, jobType, jobId } = req.query;
    
    console.log('📊 Analytics Request:', { startDate, endDate, jobType, jobId });
    
    // Build filter
    const filter = {};
    
    // FIXED: Properly convert jobId to ObjectId
    if (jobId && jobId !== 'all') {
      try {
        filter.jobId = new mongoose.Types.ObjectId(jobId);
        console.log('✅ Job filter applied:', filter.jobId);
      } catch (error) {
        console.error('❌ Invalid jobId format:', jobId);
        return res.status(400).json({ error: 'Invalid job ID format' });
      }
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    console.log('🔍 Filter being used:', JSON.stringify(filter, null, 2));

    // Status Distribution (Pie Chart Data)
    const statusDistribution = await Application.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Status Distribution:', statusDistribution);

    // Applications by Job (Bar Chart Data) - Only if no specific job selected
    let applicationsByJob = [];
    if (!jobId || jobId === 'all') {
      applicationsByJob = await Application.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $group: {
            _id: '$job.title',
            jobId: { $first: '$job._id' },
            total: { $sum: 1 },
            accepted: {
              $sum: {
                $cond: [{ $in: ['$status', ['Reviewed', 'Interview', 'Offer']] }, 1, 0]
              }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $in: ['$status', ['Applied', 'Screening']] }, 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]);
    }

    console.log('📊 Applications by Job:', applicationsByJob);

    // Funnel Data
    const funnelData = await Application.aggregate([
      { $match: filter },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          total: [
            { $count: 'total' }
          ]
        }
      }
    ]);

    // Process funnel data
    const statusCounts = {};
    if (funnelData[0] && funnelData[0].counts) {
      funnelData[0].counts.forEach(item => {
        statusCounts[item._id] = item.count;
      });
    }

    const processedFunnelData = {
      applied: statusCounts['Applied'] || 0,
      screening: statusCounts['Screening'] || 0,
      reviewed: statusCounts['Reviewed'] || 0,
      interview: statusCounts['Interview'] || 0,
      offer: statusCounts['Offer'] || 0,
      rejected: statusCounts['Rejected'] || 0
    };

    console.log('📊 Funnel Data:', processedFunnelData);

    // Bot Mimic Performance
    const botPerformance = await Application.aggregate([
      { 
        $match: { 
          ...filter, 
          'evaluation.isProcessed': true,
          'evaluation.decision': { $exists: true }
        } 
      },
      {
        $group: {
          _id: '$evaluation.decision',
          count: { $sum: 1 },
          avgScore: { $avg: '$evaluation.score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('🤖 Bot Performance:', botPerformance);

    // Acceptance Rate
    const totalApps = await Application.countDocuments(filter);
    const acceptedApps = await Application.countDocuments({
      ...filter,
      status: { $in: ['Reviewed', 'Interview', 'Offer'] }
    });
    const rejectedApps = await Application.countDocuments({
      ...filter,
      status: 'Rejected'
    });
    const acceptanceRate = totalApps > 0 ? ((acceptedApps / totalApps) * 100).toFixed(2) : 0;

    console.log('📊 Counts:', { totalApps, acceptedApps, rejectedApps });

    // Average Processing Time
    const processingTimes = await Application.aggregate([
      {
        $match: {
          ...filter,
          'evaluation.isProcessed': true,
          'evaluation.processedAt': { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$evaluation.processedAt', '$createdAt'] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const avgProcessingTime = processingTimes[0]?.avgTime || 0;

    const response = {
      overview: {
        totalApplications: totalApps,
        acceptedApplications: acceptedApps,
        rejectedApplications: rejectedApps,
        acceptanceRate: parseFloat(acceptanceRate),
        avgProcessingTime: Math.round(avgProcessingTime * 10) / 10
      },
      statusDistribution,
      applicationsByJob,
      funnelData: processedFunnelData,
      botPerformance
    };

    console.log('✅ Analytics Response:', JSON.stringify(response, null, 2));

    res.json(response);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import * as ctrl from '../controllers/controllers.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@hybridats.com
 *               password:
 *                 type: string
 *                 example: Admin@12345
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH ROUTES (PUBLIC)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/auth/register', ctrl.register);
router.post('/auth/login', ctrl.login);
router.get('/auth/profile', authenticate, ctrl.getProfile);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👔 JOB ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/jobs', ctrl.getAllJobs);
router.get('/jobs/:id', ctrl.getJobById);

router.post('/jobs', authenticate, authorize('admin'), ctrl.createJob);
router.put('/jobs/:id', authenticate, authorize('admin'), ctrl.updateJob);
router.delete('/jobs/:id', authenticate, authorize('admin'), ctrl.deleteJob);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📄 APPLICATION ROUTES (WITH FILE UPLOAD)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.post(
  '/applications',
  authenticate,
  authorize('applicant'),
  (req, res, next) => {
    console.log('🔵 BEFORE MULTER:');
    console.log('  Content-Type:', req.headers['content-type']);
    console.log('  Body:', req.body);
    console.log('  File:', req.file);
    next();
  },
  upload.single('resume'),
  (req, res, next) => {
    console.log('🟢 AFTER MULTER:');
    console.log('  Body:', req.body);
    console.log('  File:', req.file ? req.file.originalname : 'undefined');
    next();
  },
  ctrl.submitApplication
);

router.get('/applications/my', authenticate, authorize('applicant'), ctrl.getMyApplications);
router.get('/applications/:id', authenticate, ctrl.getApplicationById);
router.get('/applications', authenticate, authorize('admin'), ctrl.getAllApplications);
router.patch('/applications/:id/status', authenticate, authorize('admin'), ctrl.updateApplicationStatus);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👨‍💼 ADMIN ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/admin/create', authenticate, authorize('admin'), ctrl.createAdmin);
router.get('/admin/dashboard', authenticate, authorize('admin'), ctrl.getDashboardStats);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 TEST FILE UPLOAD ENDPOINT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/test-upload', authenticate, upload.single('resume'), (req, res) => {
  console.log('🧪 TEST UPLOAD ENDPOINT HIT');
  console.log('  File:', req.file);
  console.log('  Body:', req.body);
  
  if (!req.file) {
    return res.status(400).json({ 
      error: 'No file received',
      body: req.body,
      headers: req.headers
    });
  }
  
  res.json({ 
    success: true, 
    file: {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    },
    body: req.body,
    message: 'File uploaded successfully!'
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏥 HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ANALYTICS ROUTES (NEW)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/analytics', authenticate, authorize('admin'), ctrl.getAnalytics);


export default router;

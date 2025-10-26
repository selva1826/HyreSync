import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateSampleResume } from '../utils/helpers.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREATE USERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const superAdmin = await User.create({
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@hybridats.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      profile: { firstName: 'Super', lastName: 'Admin' },
      isSuperAdmin: true
    });

    const regularAdmin = await User.create({
      email: 'manager@hybridats.com',
      password: 'Manager@123',
      role: 'admin',
      profile: { firstName: 'HR', lastName: 'Manager' },
      createdBy: superAdmin._id,
      isSuperAdmin: false
    });

    const applicants = await User.create([
      {
        email: 'john.doe@email.com',
        password: 'Applicant@123',
        role: 'applicant',
        profile: { firstName: 'John', lastName: 'Doe', phone: '+1234567890' }
      },
      {
        email: 'jane.smith@email.com',
        password: 'Applicant@123',
        role: 'applicant',
        profile: { firstName: 'Jane', lastName: 'Smith', phone: '+1234567891' }
      }
    ]);

    console.log('✅ Created users (1 super admin, 1 regular admin, 2 applicants)');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREATE JOBS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        type: 'technical',
        status: 'published',
        description: 'We are looking for an experienced Full Stack Developer...',
        location: 'Remote',
        requirements: {
          skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
          experience: { min: 5, max: 8 },
          education: ['Bachelor in Computer Science'],
          certifications: ['AWS Certified'],
          weights: {
            skillsMatch: 40,
            experienceMatch: 30,
            educationMatch: 20,
            certificationsMatch: 10
          },
          passingScore: 75
        },
        postedBy: superAdmin._id
      },
      {
        title: 'HR Manager',
        department: 'Human Resources',
        type: 'non-technical',
        status: 'published',
        description: 'Experienced HR Manager needed...',
        location: 'San Francisco',
        requirements: {
          skills: ['HR Management', 'Recruitment'],
          experience: { min: 5, max: 10 },
          education: ['MBA in HR'],
          certifications: [],
          passingScore: 70
        },
        postedBy: superAdmin._id
      }
    ]);

    console.log('✅ Created jobs');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 TEST CREDENTIALS:');
    console.log('\n🔴 Super Admin (Can create other admins):');
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Password: ${process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345'}`);
    console.log('\n🟡 Regular Admin (Cannot create admins):');
    console.log(`  Email: ${regularAdmin.email}`);
    console.log(`  Password: Manager@123`);
    console.log('\n🟢 Applicants:');
    applicants.forEach(app => {
      console.log(`  ${app.profile.firstName}: ${app.email} / Applicant@123`);
    });
    console.log('\n📄 NOTE: Upload PDF/DOCX resumes when applying!');
    console.log('🤖 Bot Mimic will auto-process technical applications!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();

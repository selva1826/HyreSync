# 🚀 Hybrid ATS - AI-Powered Applicant Tracking System

<div align="center">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-18.x-green)
![React Version](https://img.shields.io/badge/react-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green)

**A modern, full-stack recruitment management platform combining automated and manual workflows**

[Live Demo](https://hyre-sync-pro.vercel.app) · [API Docs](https://hyresync.onrender.com/api-docs) · [Report Bug](mailto:admin@hybridats.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

**Hybrid ATS** solves a critical challenge in recruitment: managing both automated and manual application workflows in a unified system. Traditional ATS platforms only support one workflow type, forcing companies to use multiple disconnected tools.

### The Problem

- **Technical roles** (Engineering, IT, Data Science) have automated tracking via APIs
- **Non-technical roles** (HR, Marketing, Operations) require manual status updates  
- Most systems only support one approach, creating workflow fragmentation

### Our Solution

A hybrid system that intelligently handles BOTH workflows:
- ✅ Automated progression for technical roles via Bot Mimic
- ✅ Manual management for non-technical roles via admin dashboard
- ✅ Complete traceability and audit logs for all applications
- ✅ AI-powered resume parsing and candidate scoring

---

## ✨ Key Features

### 🤖 Bot Mimic Automation
- Automated status progression for technical roles
- Runs every 30 seconds in background
- Intelligent workflow: `pending → under_review → interview_scheduled`
- Complete activity logging with timestamps

### 📄 AI Resume Intelligence
- **PDF & DOCX parsing** - Extract text from multiple formats
- **NLP skill extraction** - Identify technical and soft skills
- **Experience analysis** - Parse years of experience, companies, roles
- **Smart scoring algorithm** - 100-point scoring system:
  - Skills match: 40 points
  - Experience: 30 points
  - Education: 20 points
  - Keywords: 10 points

### 👥 Role-Based Access Control
- **Applicants**: Submit applications, track status, view timeline
- **Admins**: Create jobs, manage applications, view analytics
- **Bot Mimic**: Automated background worker with audit trails

### 📊 Analytics Dashboard
- Real-time recruitment metrics
- Application status distribution (pie chart)
- Applications over time (line chart)
- Top jobs by applications (bar chart)
- Bot automation statistics

### 🔍 Complete Traceability
- Every action logged with timestamp
- Before/after values for all changes
- User identification (Admin name or "Bot Mimic")
- Full application timeline view

### 🔐 Security Features
- JWT-based authentication with 7-day expiry
- Password hashing with bcrypt (10 salt rounds)
- CORS protection with whitelisted origins
- Input validation and sanitization
- File upload restrictions (PDF/DOCX only, 10MB max)

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0.7-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.6.2-5A29E4?logo=axios&logoColor=white)

- **React 18.2** - Modern UI library with Hooks
- **Vite 5.0** - Lightning-fast build tool (10x faster than CRA)
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Beautiful, responsive charts
- **React Router** - Client-side routing

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?logo=jsonwebtokens&logoColor=white)

- **Node.js 18.x** - JavaScript runtime
- **Express 4.18** - Fast, minimalist web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 8.0** - MongoDB ODM
- **JWT** - Secure authentication
- **Multer** - File upload handling
- **pdf-parse & mammoth** - Resume parsing
- **Natural.js** - NLP for skill extraction
- **node-cron** - Background job scheduling

### DevOps & Deployment
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-CI/CD-181717?logo=github&logoColor=white)

- **Vercel** - Frontend hosting with global CDN
- **Render** - Backend hosting with auto-scaling
- **MongoDB Atlas** - Cloud database with backups
- **GitHub Actions** - CI/CD pipeline
- **Cost**: **$0/month** (100% free tier)

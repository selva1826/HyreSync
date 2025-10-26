import { useState, useEffect } from 'react';
import api from '../utils/api';
import Timeline from './Timeline';
import Analytics from './Analytics';
import BotEvaluation from './BotEvaluation';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(user.role === 'admin' ? 'all-applications' : 'my-applications');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [appFilter, setAppFilter] = useState('all'); // all, accepted, rejected
  const [selectedJobFilter, setSelectedJobFilter] = useState('all'); // NEW: Job filter

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user.role]);

  useEffect(() => {
    filterApplications();
  }, [applications, appFilter, selectedJobFilter]);

  const fetchData = async () => {
    try {
      if (user.role === 'admin') {
        const [jobsRes, appsRes, statsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications'),
          api.get('/admin/dashboard')
        ]);
        setJobs(jobsRes.data.jobs);
        setApplications(appsRes.data.applications);
        setStats(statsRes.data.stats);
      } else {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/my')
        ]);
        setJobs(jobsRes.data.jobs);
        setApplications(appsRes.data.applications);
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (appFilter === 'accepted') {
      filtered = filtered.filter(app => ['Reviewed', 'Interview', 'Offer'].includes(app.status));
    } else if (appFilter === 'rejected') {
      filtered = filtered.filter(app => app.status === 'Rejected');
    }

    // Filter by job
    if (selectedJobFilter !== 'all') {
      filtered = filtered.filter(app => app.jobId?._id === selectedJobFilter);
    }

    setFilteredApps(filtered);
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/jobs/${jobId}`);
      alert('Job deleted successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete job');
    }
  };

  const handleApply = async (jobId, formElement) => {
    try {
      const formData = new FormData();
      const fileInput = formElement.querySelector('input[name="resume"]');
      const coverLetterInput = formElement.querySelector('textarea[name="coverLetter"]');
      
      if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select a resume file');
        return;
      }
      
      formData.append('jobId', jobId);
      formData.append('resume', fileInput.files[0]);
      formData.append('coverLetter', coverLetterInput.value || '');
      
      await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('✅ Application submitted successfully! Bot Mimic will process it soon.');
      setShowApplyForm(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit application');
    }
  };

  const handleStatusUpdate = async (appId, status, comment) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status, comment });
      alert('Status updated successfully!');
      setSelectedApp(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      await api.post('/jobs', jobData);
      alert('Job created successfully!');
      setShowCreateJob(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create job');
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      await api.post('/admin/create', adminData);
      alert('Admin created successfully!');
      setShowCreateAdmin(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create admin');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Applied': { class: 'badge-blue', icon: '📝' },
      'Screening': { class: 'badge-purple', icon: '🔍' },
      'Reviewed': { class: 'badge-yellow', icon: '👀' },
      'Interview': { class: 'badge-green', icon: '💬' },
      'Offer': { class: 'badge-green', icon: '🎉' },
      'Rejected': { class: 'badge-red', icon: '❌' }
    };
    const { class: className, icon } = config[status] || config['Applied'];
    return (
      <span className={`badge ${className} flex items-center gap-1`}>
        <span>{icon}</span>
        <span>{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40 backdrop-blur-lg bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">H</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Hybrid ATS
                  </h1>
                  <p className="text-xs text-gray-500">Smart Recruitment System</p>
                </div>
              </div>
              <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'} animate-fadeInDown`}>
                {user.role.toUpperCase()}
                {user.isSuperAdmin && ' SUPER'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.profile.firstName[0]}{user.profile.lastName[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.profile.firstName} {user.profile.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              {user.role === 'admin' && (
                <button 
                  onClick={() => setShowAnalytics(true)}
                  className="btn btn-success text-sm hidden md:flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>
              )}
              {user.role === 'admin' && user.isSuperAdmin && (
                <button 
                  onClick={() => setShowCreateAdmin(true)} 
                  className="btn btn-secondary text-sm hidden md:flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Admin
                </button>
              )}
              <button onClick={onLogout} className="btn btn-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards - Admin Only */}
      {user.role === 'admin' && stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Jobs', value: stats.totalJobs, icon: '💼', gradient: 'from-blue-500 to-cyan-500', delay: 'stagger-1' },
              { label: 'Total Applications', value: stats.totalApplications, icon: '📊', gradient: 'from-green-500 to-emerald-500', delay: 'stagger-2' },
              { label: 'Pending Review', value: stats.pendingReview, icon: '⏳', gradient: 'from-amber-500 to-orange-500', delay: 'stagger-3' },
              { label: 'Bot Processed', value: stats.botProcessed, icon: '🤖', gradient: 'from-purple-500 to-pink-500', delay: 'stagger-4' }
            ].map((stat, i) => (
              <div key={i} className={`card-gradient bg-gradient-to-br ${stat.gradient} p-6 hover-lift animate-fadeInUp ${stat.delay}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-medium mb-1">{stat.label}</p>
                    <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
                  </div>
                  <div className="text-5xl opacity-20">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex space-x-2 overflow-x-auto">
          {user.role === 'admin' ? (
            <>
              <TabButton 
                active={activeTab === 'all-applications'} 
                onClick={() => setActiveTab('all-applications')}
                icon="📋"
                label="Applications"
                count={filteredApps.length}
              />
              <TabButton 
                active={activeTab === 'jobs'} 
                onClick={() => setActiveTab('jobs')}
                icon="💼"
                label="Jobs"
                count={jobs.length}
              />
            </>
          ) : (
            <>
              <TabButton 
                active={activeTab === 'my-applications'} 
                onClick={() => setActiveTab('my-applications')}
                icon="📝"
                label="My Applications"
                count={applications.length}
              />
              <TabButton 
                active={activeTab === 'browse-jobs'} 
                onClick={() => setActiveTab('browse-jobs')}
                icon="🔍"
                label="Browse Jobs"
                count={jobs.length}
              />
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* ADMIN: All Applications */}
        {activeTab === 'all-applications' && user.role === 'admin' && (
          <div>
            {/* Filter Buttons and Job Dropdown */}
            <div className="mb-6 flex flex-wrap gap-3 items-center">
              {/* Status Filters */}
              <button
                onClick={() => setAppFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  appFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setAppFilter('accepted')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  appFilter === 'accepted' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Accepted ({applications.filter(app => ['Reviewed', 'Interview', 'Offer'].includes(app.status)).length})
              </button>
              <button
                onClick={() => setAppFilter('rejected')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  appFilter === 'rejected' 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Rejected ({applications.filter(app => app.status === 'Rejected').length})
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300"></div>

              {/* Job Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Filter by Job:</span>
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredApps.length === 0 ? (
                <EmptyState 
                  icon="📭"
                  title={`No ${appFilter === 'all' ? '' : appFilter} Applications`}
                  description={selectedJobFilter !== 'all' ? `No applications found for the selected job and filter` : `Applications will appear here once candidates start applying`}
                />
              ) : (
                filteredApps.map((app, index) => (
                  <div 
                    key={app._id} 
                    className={`card hover-lift cursor-pointer animate-fadeInUp stagger-${Math.min(index + 1, 4)}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {app.applicantId?.profile.firstName[0]}{app.applicantId?.profile.lastName[0]}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {app.applicantId?.profile.firstName} {app.applicantId?.profile.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Applied for <span className="font-semibold text-indigo-600">{app.jobId?.title}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                          {app.resume && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {app.resume.originalName}
                            </span>
                          )}
                          <span className={`badge ${app.jobId?.type === 'technical' ? 'badge-purple' : 'badge-indigo'} text-xs`}>
                            {app.jobId?.type === 'technical' ? '💻 Technical' : '👔 Non-Technical'}
                          </span>
                        </div>
                        {app.evaluation?.isProcessed && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🤖</span>
                              <span className="font-bold text-gray-900">Bot Mimic Evaluation</span>
                              <span className="ml-auto text-2xl font-bold text-indigo-600">{app.evaluation.score}/100</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{app.evaluation.reasoning}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex md:flex-col items-center md:items-end gap-3">
                        {getStatusBadge(app.status)}
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ADMIN: Jobs */}
        {activeTab === 'jobs' && user.role === 'admin' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Jobs</h2>
              <button onClick={() => setShowCreateJob(true)} className="btn btn-primary flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Job
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job, index) => (
                <div key={job._id} className={`card hover-lift animate-fadeInUp stagger-${Math.min(index + 1, 4)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedJob(job)}>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${job.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                        {job.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job._id, job.title);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.requirements.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.requirements.skills.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        +{job.requirements.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className={`badge ${job.type === 'technical' ? 'badge-purple' : 'badge-indigo'}`}>
                      {job.type === 'technical' ? '💻 Technical' : '👔 Non-Technical'}
                    </span>
                    <span className="font-medium">Passing: {job.requirements.passingScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICANT: My Applications */}
        {activeTab === 'my-applications' && user.role === 'applicant' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <EmptyState 
                icon="📝"
                title="No Applications Yet"
                description="Start applying to jobs to see your applications here"
                action={
                  <button onClick={() => setActiveTab('browse-jobs')} className="btn btn-primary mt-4">
                    Browse Jobs
                  </button>
                }
              />
            ) : (
              applications.map((app, index) => (
                <div 
                  key={app._id} 
                  className={`card hover-lift cursor-pointer animate-fadeInUp stagger-${Math.min(index + 1, 4)}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{app.jobId?.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{app.jobId?.department} • {app.jobId?.location}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                      {app.evaluation?.isProcessed && (
                        <div className="mt-4">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">⭐</span>
                              <span className="font-bold text-gray-900">Your Score</span>
                              <span className="ml-auto text-2xl font-bold text-blue-600">{app.evaluation.score}/100</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{app.evaluation.reasoning}</p>
                            <button className="text-xs text-blue-600 font-semibold mt-2 hover:text-blue-700">
                              View Full Evaluation →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex md:flex-col items-center md:items-end gap-3">
                      {getStatusBadge(app.status)}
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* APPLICANT: Browse Jobs */}
        {activeTab === 'browse-jobs' && user.role === 'applicant' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job, index) => {
              const alreadyApplied = applications.some(app => app.jobId?._id === job._id);
              return (
                <div key={job._id} className={`card hover-lift animate-fadeInUp stagger-${Math.min(index + 1, 4)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedJob(job)}>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                    </div>
                    {alreadyApplied ? (
                      <span className="badge badge-green flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowApplyForm(job)}
                        className="btn btn-primary text-sm"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.skills.slice(0,4).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {job.requirements.skills.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            +{job.requirements.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={`badge ${job.type === 'technical' ? 'badge-purple' : 'badge-indigo'}`}>
                        {job.type === 'technical' ? '💻 Technical' : '👔 Non-Technical'}
                      </span>
                      <button onClick={() => setSelectedJob(job)} className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS */}
      
      {/* Application Details Modal */}
      {selectedApp && (
        <Modal onClose={() => setSelectedApp(null)} title="Application Details">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedApp.jobId?.title}</h3>
                <p className="text-gray-600">{selectedApp.jobId?.department}</p>
              </div>
              {getStatusBadge(selectedApp.status)}
            </div>

            {/* Bot Mimic Evaluation - Enhanced Display */}
            {selectedApp.evaluation?.isProcessed && (
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  Bot Mimic Evaluation
                </h4>
                <BotEvaluation 
                  evaluation={selectedApp.evaluation} 
                  requirements={selectedApp.jobId?.requirements}
                />
              </div>
            )}

            {user.role === 'admin' && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 'Reviewed', 'Moved to review')} className="btn btn-secondary text-sm">
                    📋 Review
                  </button>
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 'Interview', 'Scheduled interview')} className="btn btn-success text-sm">
                    💬 Interview
                  </button>
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 'Rejected', 'Not a fit')} className="btn btn-danger text-sm">
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}

            <Timeline applicationId={selectedApp._id} />
          </div>
        </Modal>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <Modal onClose={() => setSelectedJob(null)} title="Job Details">
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {selectedJob.department}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedJob.location}
                </span>
                <span className={`badge ${selectedJob.type === 'technical' ? 'badge-purple' : 'badge-indigo'}`}>
                  {selectedJob.type === 'technical' ? '💻 Technical' : '👔 Non-Technical'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">📝 Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.requirements.skills.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">💼</span>
                  Experience
                </h4>
                <p className="text-gray-700">
                  {selectedJob.requirements.experience.min} - {selectedJob.requirements.experience.max} years
                </p>
              </div>
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">🎓</span>
                  Education
                </h4>
                <p className="text-gray-700">{selectedJob.requirements.education.join(', ')}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">⚡ Bot Mimic Information</h4>
              <p className="text-sm text-gray-700">
                For technical roles, applications are automatically evaluated by our AI Bot Mimic. 
                Minimum passing score: <span className="font-bold text-amber-600">{selectedJob.requirements.passingScore}/100</span>
              </p>
            </div>

            {user.role === 'applicant' && !applications.some(app => app.jobId?._id === selectedJob._id) && (
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setShowApplyForm(selectedJob);
                }}
                className="btn btn-primary w-full text-lg"
              >
                Apply for this Position
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Apply Form Modal */}
      {showApplyForm && (
        <Modal onClose={() => setShowApplyForm(null)} title={`Apply for ${showApplyForm.title}`}>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleApply(showApplyForm._id, e.target);
          }}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Resume (PDF or DOCX) *
                </label>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upload your resume in PDF or DOCX format (max 5MB)
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  name="coverLetter"
                  rows="5"
                  className="input resize-none"
                  placeholder="Tell us why you're a great fit for this position..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Submit Application
                </button>
                <button type="button" onClick={() => setShowApplyForm(null)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <Modal onClose={() => setShowCreateJob(false)} title="Create New Job">
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const skills = formData.get('skills').split(',').map(s => s.trim());
            handleCreateJob({
              title: formData.get('title'),
              department: formData.get('department'),
              type: formData.get('type'),
              description: formData.get('description'),
              location: formData.get('location'),
              requirements: {
                skills,
                experience: {
                  min: parseInt(formData.get('expMin')),
                  max: parseInt(formData.get('expMax'))
                },
                education: [formData.get('education')],
                certifications: [],
                passingScore: parseInt(formData.get('passingScore'))
              }
            });
          }}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <input type="text" name="title" placeholder="Job Title" className="input" required />
              <input type="text" name="department" placeholder="Department" className="input" required />
              <select name="type" className="input" required>
                <option value="technical">Technical (Auto-processed by Bot Mimic)</option>
                <option value="non-technical">Non-Technical (Manual review)</option>
              </select>
              <input type="text" name="location" placeholder="Location" className="input" required />
              <textarea name="description" rows="3" placeholder="Job Description" className="input resize-none" required />
              <input type="text" name="skills" placeholder="Required Skills (comma-separated)" className="input" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" name="expMin" placeholder="Min Experience (years)" className="input" min="0" required />
                <input type="number" name="expMax" placeholder="Max Experience (years)" className="input" min="0" required />
              </div>
              <input type="text" name="education" placeholder="Education Requirement" className="input" required />
              <input type="number" name="passingScore" placeholder="Passing Score (0-100)" className="input" min="0" max="100" defaultValue="70" required />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary flex-1">Create Job</button>
              <button type="button" onClick={() => setShowCreateJob(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <Modal onClose={() => setShowCreateAdmin(false)} title="Create New Admin">
          <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              New admins will have admin privileges but cannot create other admins.
            </p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleCreateAdmin({
              email: formData.get('email'),
              password: formData.get('password'),
              firstName: formData.get('firstName'),
              lastName: formData.get('lastName')
            });
            e.target.reset();
          }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="First Name" className="input" required />
                <input type="text" name="lastName" placeholder="Last Name" className="input" required />
              </div>
              <input type="email" name="email" placeholder="Email Address" className="input" required />
              <input type="password" name="password" placeholder="Password (min 6 characters)" className="input" minLength="6" required />
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">Create Admin</button>
                <button type="button" onClick={() => setShowCreateAdmin(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalytics && <Analytics onClose={() => setShowAnalytics(false)} jobs={jobs} />}
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className={`badge ${active ? 'bg-white bg-opacity-20 text-white border-white border-opacity-30' : 'badge-blue'}`}>
        {count}
      </span>
    </button>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card text-center py-16 animate-fadeInUp">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInDown" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

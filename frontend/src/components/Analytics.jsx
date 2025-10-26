import { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

function Analytics({ onClose, jobs }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedJob]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = selectedJob !== 'all' ? { jobId: selectedJob } : {};
      const { data } = await api.get('/analytics', { params });
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Analytics error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Prepare chart data
  const statusData = analytics.statusDistribution.map(item => ({
    name: item._id,
    value: item.count
  }));

  const COLORS = {
    'Applied': '#3b82f6',
    'Screening': '#8b5cf6',
    'Reviewed': '#f59e0b',
    'Interview': '#10b981',
    'Offer': '#059669',
    'Rejected': '#ef4444'
  };

  const funnelData = [
    { name: 'Applied', value: analytics.funnelData.applied || 0 },
    { name: 'Screening', value: analytics.funnelData.screening || 0 },
    { name: 'Reviewed', value: analytics.funnelData.reviewed || 0 },
    { name: 'Interview', value: analytics.funnelData.interview || 0 },
    { name: 'Offer', value: analytics.funnelData.offer || 0 }
  ];

  const jobData = analytics.applicationsByJob.map(item => ({
    name: item._id.length > 20 ? item._id.substring(0, 20) + '...' : item._id,
    total: item.total,
    accepted: item.accepted,
    rejected: item.rejected,
    pending: item.pending
  }));

  const selectedJobDetails = selectedJob !== 'all' 
    ? jobs.find(j => j._id === selectedJob) 
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-scaleIn my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Recruitment Analytics
              </h2>
              <p className="text-gray-600 mt-1">Comprehensive insights into your hiring pipeline</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Job Filter Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Filter by Job:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>
                  {job.title} ({job.type})
                </option>
              ))}
            </select>
            {selectedJobDetails && (
              <span className={`badge ${selectedJobDetails.type === 'technical' ? 'badge-purple' : 'badge-indigo'}`}>
                {selectedJobDetails.type === 'technical' ? '💻 Technical' : '👔 Non-Technical'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              icon="📝" 
              label="Total Applications" 
              value={analytics.overview.totalApplications}
              gradient="from-blue-500 to-cyan-500"
            />
            <MetricCard 
              icon="✅" 
              label="Accepted" 
              value={analytics.overview.acceptedApplications}
              gradient="from-green-500 to-emerald-500"
            />
            <MetricCard 
              icon="❌" 
              label="Rejected" 
              value={analytics.overview.rejectedApplications}
              gradient="from-red-500 to-rose-500"
            />
            <MetricCard 
              icon="📈" 
              label="Acceptance Rate" 
              value={`${analytics.overview.acceptanceRate}%`}
              gradient="from-purple-500 to-pink-500"
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm font-medium mb-1">Avg Processing Time</p>
                  <h3 className="text-4xl font-bold">{analytics.overview.avgProcessingTime} min</h3>
                </div>
                <div className="text-5xl opacity-20">⚡</div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm font-medium mb-1">Pending Review</p>
                  <h3 className="text-4xl font-bold">
                    {analytics.overview.totalApplications - analytics.overview.acceptedApplications - analytics.overview.rejectedApplications}
                  </h3>
                </div>
                <div className="text-5xl opacity-20">⏳</div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution Pie Chart */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🥧</span>
                Application Status Distribution
                {selectedJobDetails && (
                  <span className="text-sm font-normal text-gray-600">
                    - {selectedJobDetails.title}
                  </span>
                )}
              </h3>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Funnel Chart */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📉</span>
                Hiring Funnel
                {selectedJobDetails && (
                  <span className="text-sm font-normal text-gray-600">
                    - {selectedJobDetails.title}
                  </span>
                )}
              </h3>
              {funnelData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Applications by Job - Only show when "All Jobs" selected */}
          {selectedJob === 'all' && jobData.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Applications by Job Post
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={jobData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accepted" stackId="a" fill="#10b981" name="Accepted" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bot Mimic Performance */}
          {analytics.botPerformance.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Bot Mimic Performance
                {selectedJobDetails && (
                  <span className="text-sm font-normal text-gray-600">
                    - {selectedJobDetails.title}
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.botPerformance.map((perf, i) => (
                  <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 capitalize">{perf._id}</span>
                      <span className="text-3xl">{perf._id === 'passed' ? '✅' : '❌'}</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{perf.count}</div>
                    <div className="text-sm text-gray-600">Avg Score: {perf.avgScore.toFixed(1)}/100</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, gradient }) {
  return (
    <div className={`card-gradient bg-gradient-to-br ${gradient} p-6 text-white animate-fadeInUp hover-lift`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

export default Analytics;

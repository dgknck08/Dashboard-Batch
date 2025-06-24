import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

import { 
  Users, Activity, AlertTriangle, CheckCircle, TrendingUp, Calendar, RefreshCw, BarChart3, PieChart, Wifi, WifiOff 
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [usersWithOverdue, setUsersWithOverdue] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [justRefreshed, setJustRefreshed] = useState(false);


  

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 20 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async (isAuto = false) => {
  try {
    setLoading(true);
    setError(null);

    const [statsResponse, topPerformersResponse, overdueResponse, activeResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/dashboard/stats`),
      fetch(`${API_BASE_URL}/dashboard/top-performers?limit=10`),
      fetch(`${API_BASE_URL}/dashboard/overdue-issues`),
      fetch(`${API_BASE_URL}/dashboard/most-active?limit=10`)
    ]);

    if (!statsResponse.ok || !topPerformersResponse.ok || !overdueResponse.ok || !activeResponse.ok) {
      throw new Error('API call failed');
    }


    const stats = await statsResponse.json();
    const performers = await topPerformersResponse.json();
    const overdue = await overdueResponse.json();
    const active = await activeResponse.json();

    console.log('📊 Stats:', stats);
    console.log('🏆 Top Performers:', performers);
    console.log('⏰ Users With Overdue:', overdue);
    console.log('🔥 Most Active:', active);
    
    setDashboardStats(stats);
    setTopPerformers(performers);
    setUsersWithOverdue(overdue);
    setMostActive(active);
    setLastUpdated(new Date());

    if (isAuto) {
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 3000); // 3 saniye göster
    }

  } catch (err) {
    console.error('Dashboard API Error:', err);
    setError(err.message);
    setDashboardStats(null);
    setTopPerformers([]);
    setUsersWithOverdue([]);
    setMostActive([]);
  } finally {
    setLoading(false);
  }
};

  const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto h-16 w-16 text-gray-300 mb-4 flex items-center justify-center">
          <Icon size={64} strokeWidth={1} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full">
            <WifiOff size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Backend connection required</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ConnectionError = () => (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mb-6 shadow-lg w-full">
      <div className="flex items-center justify-center">
        <div className="flex items-center max-w-2xl mx-auto">
          <div className="flex-shrink-0">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="ml-4 flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-red-800 mb-1">Backend Connection Error</h3>
            <p className="text-red-700 mb-3">
              Cannot connect to Redmine API. Please ensure the backend service is running.
            </p>
            <div className="flex justify-center sm:justify-start">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, subtitle, trend, color, icon: Icon }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-amber-500 to-amber-600',
      purple: 'from-violet-500 to-violet-600'
    };

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 flex flex-col items-center text-center">
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`bg-gradient-to-r ${colorClasses[color]} p-3 rounded-lg text-white`}>
              <Icon size={20} />
            </div>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{title}</h3>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {trend && (
            <div className="mt-2">
              <span className={`text-sm font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.positive ? '+' : ''}{trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const UserTable = ({ users, title, showColumn, columnLabel, icon: Icon }) => {
    if (users.length === 0) {
      return (
        <EmptyState
          title={`No ${title} Data`}
          description="User data could not be retrieved from backend."
          icon={Icon}
        />
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Icon size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{columnLabel}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active Issues</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 5).map((user) => (
                <tr key={user.username} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      showColumn === 'completionRate' 
                        ? user.completionRate >= 90 ? 'bg-emerald-100 text-emerald-800' :
                          user.completionRate >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        : user.overdueIssueCount > 10 ? 'bg-red-100 text-red-800' :
                          user.overdueIssueCount > 5 ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {showColumn === 'completionRate' 
                        ? `${user.completionRate?.toFixed(1) || 0}%`
                        : user.overdueIssueCount || 0
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {user.activeIssueCount || 0}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, (user.activeIssueCount || 0) * 4)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CompletionRateChart = () => {
    if (topPerformers.length === 0) {
      return (
        <EmptyState
          title="No Performance Data"
          description="User performance data could not be retrieved from backend."
          icon={BarChart3}
        />
      );
    }

    const chartData = topPerformers.map(user => ({
      name: `${user.firstName} ${user.lastName}`,
      completionRate: user.completionRate || 0,
      completed: user.completedIssueCount || 0,
      active: user.activeIssueCount || 0
    }));

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Top Performing Users</h3>
        </div>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'completionRate' ? `${value}%` : value,
                  name === 'completionRate' ? 'Completion Rate' : 
                  name === 'completed' ? 'Completed Issues' : 'Active Issues'
                ]}
              />
              <Legend />
              <Bar dataKey="completionRate" fill="#3b82f6" name="Completion Rate (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const IssueStatusChart = () => {
    if (!dashboardStats) {
      return (
        <EmptyState
          title="No Statistics Data"
          description="Issue status data could not be retrieved from backend."
          icon={PieChart}
        />
      );
    }

    const pieData = [
      { name: 'Open Issues', value: dashboardStats.openIssues, color: '#3b82f6' },
      { name: 'Closed Issues', value: dashboardStats.closedIssues, color: '#10b981' },
      { name: 'Overdue Issues', value: dashboardStats.overdueIssues, color: '#ef4444' }
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <PieChart size={20} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Issue Status Distribution</h3>
        </div>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="p-6 bg-white rounded-xl shadow-xl mb-4 flex justify-center">
            <RefreshCw className="animate-spin h-10 w-10 text-indigo-600" />
          </div>
          <p className="text-lg text-gray-700 font-medium">Loading dashboard...</p>
          <p className="text-gray-500 mt-1">Fetching data from backend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Redmine Dashboard</h1>
            <p className="text-gray-600">Project management and performance tracking</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-md">
              <Wifi size={14} className={error ? "text-red-500" : "text-green-500"} />
              <span className="text-sm text-gray-600">
                {error ? "Connection Error" : "Connected"}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {error && <ConnectionError />}

        {dashboardStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              title="Total Issues"
              value={dashboardStats.totalIssues}
              color="blue"
              icon={Activity}
            />
            <StatCard
              title="Open Issues"
              value={dashboardStats.openIssues}
              color="yellow"
              icon={AlertTriangle}
            />
            <StatCard
              title="Closed Issues"
              value={dashboardStats.closedIssues}
              color="green"
              icon={CheckCircle}
            />
            <StatCard
              title="Overdue Issues"
              value={dashboardStats.overdueIssues}
              color="red"
              icon={Calendar}
            />
            <StatCard
              title="Avg Completion"
              value={`${dashboardStats.avgCompletionTime} days`}
              color="purple"
              icon={TrendingUp}
            />
            <StatCard
              title="Active Users"
              value={dashboardStats.activeUsers}
              color="blue"
              icon={Users}
            />
          </div>
        ) : (
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md">
              <EmptyState
                title="Statistics Data Unavailable"
                description="Dashboard statistics could not be retrieved from backend."
                icon={Activity}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CompletionRateChart />
          <IssueStatusChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserTable
            users={topPerformers}
            title="Top Performance"
            showColumn="completionRate"
            columnLabel="Completion Rate"
            icon={TrendingUp}
          />
          <UserTable
            users={usersWithOverdue}
            title="Users with Overdue Issues"
            showColumn="overdueIssueCount"
            columnLabel="Overdue Count"
            icon={AlertTriangle}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

import { 
  Users, Activity, AlertTriangle, CheckCircle, TrendingUp, Calendar, RefreshCw, BarChart3, PieChart as LucidePieChart 
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [usersWithOverdue, setUsersWithOverdue] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 20 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
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
        throw new Error('API çağrısında hata oluştu');
      }

      const stats = await statsResponse.json();
      const performers = await topPerformersResponse.json();
      const overdue = await overdueResponse.json();
      const active = await activeResponse.json();

      setDashboardStats(stats);
      setTopPerformers(performers);
      setUsersWithOverdue(overdue);
      setMostActive(active);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Dashboard API Error:', err);
      setError(err.message);

      // Backend bağlantısı olmadığında örnek veri göster
      setDashboardStats({
        totalIssues: 1250,
        openIssues: 320,
        closedIssues: 930,
        overdueIssues: 45,
        avgCompletionTime: 5.2,
        activeUsers: 28
      });
      setTopPerformers([
        { username: 'ahmet.yilmaz', firstName: 'Ahmet', lastName: 'Yılmaz', completionRate: 95.2, completedIssueCount: 48, activeIssueCount: 3 },
        { username: 'ayse.kaya', firstName: 'Ayşe', lastName: 'Kaya', completionRate: 92.8, completedIssueCount: 42, activeIssueCount: 5 },
        { username: 'mehmet.ozkan', firstName: 'Mehmet', lastName: 'Özkan', completionRate: 89.5, completedIssueCount: 38, activeIssueCount: 4 },
        { username: 'fatma.celik', firstName: 'Fatma', lastName: 'Çelik', completionRate: 87.3, completedIssueCount: 35, activeIssueCount: 6 },
        { username: 'ali.demir', firstName: 'Ali', lastName: 'Demir', completionRate: 85.1, completedIssueCount: 32, activeIssueCount: 7 }
      ]);
      setUsersWithOverdue([
        { username: 'can.arslan', firstName: 'Can', lastName: 'Arslan', overdueIssueCount: 8, activeIssueCount: 12 },
        { username: 'elif.yildirim', firstName: 'Elif', lastName: 'Yıldırım', overdueIssueCount: 6, activeIssueCount: 10 },
        { username: 'burak.sahin', firstName: 'Burak', lastName: 'Şahin', overdueIssueCount: 5, activeIssueCount: 8 }
      ]);
      setMostActive([
        { username: 'ahmet.yilmaz', firstName: 'Ahmet', lastName: 'Yılmaz', activeIssueCount: 15, completionRate: 95.2 },
        { username: 'ayse.kaya', firstName: 'Ayşe', lastName: 'Kaya', activeIssueCount: 12, completionRate: 92.8 },
        { username: 'mehmet.ozkan', firstName: 'Mehmet', lastName: 'Özkan', activeIssueCount: 10, completionRate: 89.5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );

  const ConnectionError = () => (
    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 mb-8">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">Backend Bağlantı Hatası</h3>
          <p className="text-red-700 mt-1">
            Redmine API'sine bağlanılamıyor. Lütfen backend servisinin çalışır durumda olduğundan emin olun.
          </p>
          <div className="mt-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Yeniden Deniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                  Yeniden Dene
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, subtitle, trend, color, icon: Icon }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
      green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
      red: 'from-red-500 to-red-600 shadow-red-500/25',
      yellow: 'from-amber-500 to-amber-600 shadow-amber-500/25',
      purple: 'from-violet-500 to-violet-600 shadow-violet-500/25'
    };

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`bg-gradient-to-r ${colorClasses[color]} p-3 rounded-lg text-white shadow-lg`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</h3>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <span className={`text-sm font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.positive ? '+' : ''}{trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const UserTable = ({ users, title, showColumn, columnLabel, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon size={20} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{columnLabel}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif İşler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.slice(0, 5).map((user) => (
              <tr key={user.username} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {user.activeIssueCount || 0}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
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

  const CompletionRateChart = () => {
    if (topPerformers.length === 0) {
      return (
        <EmptyState
          title="Performans Verisi Yok"
          description="Kullanıcı performans verileri backend'den alınamadı."
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">En İyi Performans Gösteren Kullanıcılar</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'completionRate' ? `${value}%` : value,
                name === 'completionRate' ? 'Tamamlama Oranı' : 
                name === 'completed' ? 'Tamamlanan İşler' : 'Aktif İşler'
              ]}
            />
            <Legend />
            <Bar dataKey="completionRate" fill="#3b82f6" name="Tamamlama Oranı (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const IssueStatusChart = () => {
    if (!dashboardStats) {
      return (
        <EmptyState
          title="İstatistik Verisi Yok"
          description="Issue durum verileri backend'den alınamadı."
          icon={LucidePieChart}
        />
      );
    }

    const pieData = [
      { name: 'Açık İşler', value: dashboardStats.openIssues, color: '#3b82f6' },
      { name: 'Kapalı İşler', value: dashboardStats.closedIssues, color: '#10b981' },
      { name: 'Geciken İşler', value: dashboardStats.overdueIssues, color: '#ef4444' }
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <LucidePieChart size={20} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">İş Durumu Dağılımı</h3>
        </div>
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
    );
  };

  if (loading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Redmine Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Yenileniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                  Yenile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backend bağlantı hatası varsa */}
        {error && <ConnectionError />}

        {/* İstatistik Kartları */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <StatCard
              title="Toplam İşler"
              value={dashboardStats.totalIssues}
              color="blue"
              icon={Activity}
            />
            <StatCard
              title="Açık İşler"
              value={dashboardStats.openIssues}
              color="yellow"
              icon={AlertTriangle}
            />
            <StatCard
              title="Kapalı İşler"
              value={dashboardStats.closedIssues}
              color="green"
              icon={CheckCircle}
            />
            <StatCard
              title="Geciken İşler"
              value={dashboardStats.overdueIssues}
              color="red"
              icon={Calendar}
            />
            <StatCard
              title="Ort. Tamamlama"
              value={`${dashboardStats.avgCompletionTime} gün`}
              color="purple"
              icon={TrendingUp}
            />
            <StatCard
              title="Aktif Kullanıcılar"
              value={dashboardStats.activeUsers}
              color="blue"
              icon={Users}
            />
          </div>
        )}

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CompletionRateChart />
          <IssueStatusChart />
        </div>

        {/* Kullanıcı Tabloları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserTable
            users={topPerformers}
            title="En İyi Performans"
            showColumn="completionRate"
            columnLabel="Tamamlama Oranı"
            icon={TrendingUp}
          />
          <UserTable
            users={usersWithOverdue}
            title="Geciken İşleri Olan Kullanıcılar"
            showColumn="overdueIssueCount"
            columnLabel="Geciken İş Sayısı"
            icon={AlertTriangle}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

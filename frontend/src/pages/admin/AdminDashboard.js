import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UsersIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Fetch admin statistics with real-time updates
  const { data: dashboardStats, refetch: refetchDashboard, error: dashboardError, isLoading: dashboardLoading } = useQuery(
    'adminDashboard', 
    adminAPI.getDashboard,
    {
      refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
      staleTime: 0, // Always consider data stale
      cacheTime: 0, // Don't cache the data
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      onError: (error) => {
        console.error('Admin dashboard API error:', error);
        toast.error(`Admin dashboard error: ${error.response?.data?.message || error.message}`);
      }
    }
  );
  const { data: usersData, refetch: refetchUsers } = useQuery(
    'adminUsers', 
    () => adminAPI.getUsers({ limit: 5 }),
    {
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0,
      onError: (error) => {
        console.error('Admin users API error:', error);
        toast.error(`Admin users error: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Extract stats with detailed logging - handle Axios response structure
  const actualData = dashboardStats?.data || dashboardStats;
  const stats = {
    totalUsers: actualData?.userStats?.total || 0,
    totalWorkEntries: actualData?.workEntryStats?.total || 0,
    totalNotes: actualData?.noteStats?.total || 0,
    activeUsers: actualData?.userStats?.active || 0
  };
  


  const systemHealth = actualData?.systemHealth || {
    database: { status: 'unknown' },
    server: { uptime: 0, memory: { used: 0, total: 0 } }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (mb) => {
    return `${Math.round(mb)}MB`;
  };

  const actualUsersData = usersData?.data || usersData;
  const recentUsers = actualUsersData?.users || [];



  // Show loading spinner if dashboard is loading
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading admin dashboard...</span>
      </div>
    );
  }

  // Show error if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500">Current user: {user?.username || 'Not logged in'}</p>
          <p className="text-sm text-gray-500">Current role: {user?.role || 'No role'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show error if API failed
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Dashboard Error</h1>
          <p className="text-gray-600 mb-4">{dashboardError.response?.data?.message || dashboardError.message}</p>
          <button 
            onClick={() => refetchDashboard()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg mr-4">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="mt-2 text-purple-100">System overview and management tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-purple-100">
              <ClockIcon className="h-5 w-5" />
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
              <div className="flex items-center mt-2 text-xs text-blue-600">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                <span>Growing steadily</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500 rounded-full shadow-lg">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Work Entries</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalWorkEntries}</p>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                <span>Productivity high</span>
              </div>
            </div>
            <div className="p-3 bg-green-500 rounded-full shadow-lg">
              <BriefcaseIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Notes</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalNotes}</p>
              <div className="flex items-center mt-2 text-xs text-purple-600">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                <span>Ideas flowing</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500 rounded-full shadow-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Active Users</p>
              <p className="text-3xl font-bold text-orange-900">{stats.activeUsers}</p>
              <div className="flex items-center mt-2 text-xs text-orange-600">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                <span>All secure</span>
              </div>
            </div>
            <div className="p-3 bg-orange-500 rounded-full shadow-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <CogIcon className="h-5 w-5 text-gray-600" />
            </div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="group flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-2 bg-blue-500 rounded-lg mr-4 group-hover:bg-blue-600 transition-colors">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-blue-900">Manage Users</p>
                <p className="text-sm text-blue-600">View and edit user accounts</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/work-entries')}
              className="group flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-2 bg-green-500 rounded-lg mr-4 group-hover:bg-green-600 transition-colors">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-green-900">Work Entries</p>
                <p className="text-sm text-green-600">Monitor all work entries</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/notes')}
              className="group flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-2 bg-purple-500 rounded-lg mr-4 group-hover:bg-purple-600 transition-colors">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-purple-900">Notes</p>
                <p className="text-sm text-purple-600">View all user notes</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/users?action=add')}
              className="group flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-2 bg-orange-500 rounded-lg mr-4 group-hover:bg-orange-600 transition-colors">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-orange-900">Add User</p>
                <p className="text-sm text-orange-600">Create new user accounts</p>
              </div>
            </button>

            <button
              onClick={() => {
                refetchDashboard();
                refetchUsers();
                toast.success('Dashboard refreshed!');
              }}
              className="group flex items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-2 bg-teal-500 rounded-lg mr-4 group-hover:bg-teal-600 transition-colors">
                <ArrowPathIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-teal-900">Refresh Data</p>
                <p className="text-sm text-teal-600">Update all statistics</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              Recent Users ({recentUsers.length})
            </h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          {recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                  {user.profile?.avatar ? (
                    <img 
                      src={`http://localhost:5000${user.profile.avatar}`} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.profile?.firstName && user.profile?.lastName 
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user.username
                      }
                    </p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    user.role === 'admin' 
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                  }`}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => navigate(`/admin/users`)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                    title="View user details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No users found</p>
            </div>
          )}
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all users →
            </button>
          </div>
        </div>
      </div>

      {/* System Health Dashboard */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-xl font-bold flex items-center">
            <ServerIcon className="h-6 w-6 mr-2" />
            System Health & Performance
          </h3>
          <p className="text-blue-100 mt-1">Real-time system monitoring and health checks</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CircleStackIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Database
                </h4>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  systemHealth.database.status === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {systemHealth.database.status === 'connected' ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  )}
                  <span className="capitalize">{systemHealth.database.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Database Name</p>
                  <p className="font-medium text-gray-900">{systemHealth.database.name || 'work-tracker'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Host</p>
                  <p className="font-medium text-gray-900">{systemHealth.database.host || 'localhost'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Collections</p>
                  <p className="font-medium text-gray-900">{systemHealth.database.collections || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Connection Status</p>
                  <p className={`font-medium ${
                    systemHealth.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {systemHealth.database.status === 'connected' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Server Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CpuChipIcon className="h-5 w-5 mr-2 text-green-600" />
                  Server
                </h4>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Online</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Uptime</p>
                  <p className="font-medium text-gray-900">{formatUptime(systemHealth.server.uptime)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Platform</p>
                  <p className="font-medium text-gray-900">{systemHealth.server.platform || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Memory Used</p>
                  <p className="font-medium text-gray-900">{formatMemory(systemHealth.server.memory?.used || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Node Version</p>
                  <p className="font-medium text-gray-900">{systemHealth.server.nodeVersion || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900">User Engagement</h4>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-500">{stats.activeUsers} of {stats.totalUsers} active</p>
            </div>

            <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <BriefcaseIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900">Productivity</h4>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.totalWorkEntries}
              </p>
              <p className="text-xs text-gray-500">Total work entries</p>
            </div>

            <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900">Content Creation</h4>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.totalNotes}
              </p>
              <p className="text-xs text-gray-500">Notes and documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

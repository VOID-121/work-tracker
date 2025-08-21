import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workEntriesAPI, notesAPI, passwordsAPI } from '../services/api';
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
 
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workStats, isLoading: workStatsLoading } = useQuery(
    'workStats',
    workEntriesAPI.getStats,
    {
      select: (response) => response.data,
      staleTime: 5 * 1000, // 5 seconds
      refetchInterval: 10 * 1000, // Refetch every 10 seconds
    }
  );

  const { data: notesStats, isLoading: notesStatsLoading } = useQuery(
    'notesStats',
    notesAPI.getStats,
    {
      select: (response) => response.data,
      staleTime: 5 * 1000, // 5 seconds
      refetchInterval: 10 * 1000, // Refetch every 10 seconds
    }
  );

  const { data: passwordStats, isLoading: passwordStatsLoading } = useQuery(
    'passwordStats',
    passwordsAPI.getStats,
    {
      staleTime: 5 * 1000, // 5 seconds
      refetchInterval: 10 * 1000, // Refetch every 10 seconds
    }
  );

  const { data: recentWorkEntries, isLoading: recentWorkLoading } = useQuery(
    'recentWorkEntries',
    () => workEntriesAPI.getAll({ limit: 5, sortBy: 'createdAt' }),
    {
      select: (response) => response.data.workEntries,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const { data: recentNotes, isLoading: recentNotesLoading } = useQuery(
    'recentNotes',
    () => notesAPI.getAll({ limit: 5, sortBy: 'createdAt' }),
    {
      select: (response) => response.data.notes,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries('workStats'),
        queryClient.invalidateQueries('notesStats'),
        queryClient.invalidateQueries('passwordStats'),
        queryClient.invalidateQueries('recentWorkEntries'),
        queryClient.invalidateQueries('recentNotes')
      ]);
      toast.success('Dashboard refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'On Hold':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  if (workStatsLoading || notesStatsLoading || passwordStatsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl text-white p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              {getTimeGreeting()}, {user?.profile?.firstName || user?.username}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Welcome back to your work tracker dashboard. Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="group inline-flex items-center px-4 py-2 border border-white border-opacity-30 text-sm font-medium rounded-lg text-white hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
            <div className="hidden md:block">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <BriefcaseIcon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Work Entries</p>
              <p className="text-3xl font-bold text-blue-900">
                {workStats?.statusStats?.reduce((total, stat) => total + stat.count, 0) || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full shadow-lg">
              <BriefcaseIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed Tasks</p>
              <p className="text-3xl font-bold text-green-900">
                {workStats?.statusStats?.find(s => s._id === 'Completed')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-full shadow-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Notes</p>
              <p className="text-3xl font-bold text-purple-900">
                {notesStats?.totalNotes || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full shadow-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Completed Tasks</p>
              <p className="text-3xl font-bold text-orange-900">
                {workStats?.statusStats?.find(stat => stat._id === 'Completed')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full shadow-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Passwords Stored</p>
              <p className="text-3xl font-bold text-indigo-900">
                {passwordStats?.totalPasswords || 0}
              </p>
            </div>
            <div className="p-3 bg-indigo-500 rounded-full shadow-lg">
              <KeyIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Work Entries */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              </div>
              Recent Work Entries
            </h3>
          </div>
          
          {recentWorkLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : recentWorkEntries?.length > 0 ? (
            <div className="space-y-3">
              {recentWorkEntries.map((entry) => (
                <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {entry.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm">No work entries yet</p>
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <DocumentTextIcon className="h-5 w-5 text-purple-600" />
              </div>
              Recent Notes
            </h3>
          </div>
          
          {recentNotesLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : recentNotes?.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {note.content.substring(0, 60)}...
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex items-center space-x-1">
                    {note.isImportant && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                      {note.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm">No notes yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg mr-3">
            <BriefcaseIcon className="h-5 w-5 text-gray-600" />
          </div>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => navigate('/work-entries')}
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-blue-500 rounded-full mb-3 group-hover:bg-blue-600 transition-colors">
              <BriefcaseIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-900">Add Work Entry</span>
          </button>
          <button 
            onClick={() => navigate('/notes')}
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-purple-500 rounded-full mb-3 group-hover:bg-purple-600 transition-colors">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-purple-900">Create Note</span>
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-green-500 rounded-full mb-3 group-hover:bg-green-600 transition-colors">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-green-900">View Reports</span>
          </button>

          <button 
            onClick={() => navigate('/passwords')}
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-indigo-500 rounded-full mb-3 group-hover:bg-indigo-600 transition-colors">
              <KeyIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-indigo-900">Password Manager</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

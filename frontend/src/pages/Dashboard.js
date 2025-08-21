import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workEntriesAPI, notesAPI } from '../services/api';
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: workStats, isLoading: workStatsLoading } = useQuery(
    'workStats',
    workEntriesAPI.getStats,
    {
      select: (response) => response.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: notesStats, isLoading: notesStatsLoading } = useQuery(
    'notesStats',
    notesAPI.getStats,
    {
      select: (response) => response.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
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

  if (workStatsLoading || notesStatsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          {getTimeGreeting()}, {user?.profile?.firstName || user?.username}! 👋
        </h1>
        <p className="text-primary-100">
          Welcome back to your work tracker dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Work Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {workStats?.statusStats?.reduce((total, stat) => total + stat.count, 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {workStats?.statusStats?.find(s => s._id === 'Completed')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">
                {notesStats?.totalNotes || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Time Spent (hrs)</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((workStats?.totalTimeSpent || 0) / 60 * 10) / 10}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Work Entries */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Work Entries</h3>
            <BriefcaseIcon className="h-5 w-5 text-gray-400" />
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
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
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/work-entries')}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <BriefcaseIcon className="h-5 w-5" />
            <span>Add Work Entry</span>
          </button>
          <button 
            onClick={() => navigate('/notes')}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Create Note</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <ChartBarIcon className="h-5 w-5" />
            <span>View Reports</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Time Tracker</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

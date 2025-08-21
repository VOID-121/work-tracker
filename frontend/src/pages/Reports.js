import React from 'react';
import { useQuery } from 'react-query';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { workEntriesAPI, notesAPI } from '../services/api';

const Reports = () => {
  // Fetch data for reports with real-time updates
  const { data: workStats } = useQuery('workStats', workEntriesAPI.getStats, {
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 0,
    select: (response) => response.data || response,
  });
  const { data: notesStats } = useQuery('notesStats', notesAPI.getStats, {
    refetchInterval: 10000,
    staleTime: 0,
    select: (response) => response.data || response,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Pending': return 'text-blue-600 bg-blue-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Work': 'text-blue-600 bg-blue-100',
      'Personal': 'text-purple-600 bg-purple-100',
      'Health': 'text-green-600 bg-green-100',
      'Finance': 'text-yellow-600 bg-yellow-100',
      'Education': 'text-indigo-600 bg-indigo-100',
      'Other': 'text-gray-600 bg-gray-100'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="mt-2 text-gray-600">Comprehensive insights into your work entries and notes</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Work Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {workStats?.statusStats?.reduce((total, stat) => total + stat.count, 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {workStats?.statusStats?.find(stat => stat._id === 'Completed')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">
                {notesStats?.totalNotes || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {workStats?.statusStats?.find(stat => stat._id === 'In Progress')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Work Entries Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Work Entries by Status</h3>
          {workStats?.statusStats && workStats.statusStats.length > 0 ? (
            <div className="space-y-4">
              {workStats.statusStats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stat._id)}`}>
                      {stat._id}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(stat.count / workStats.statusStats.reduce((total, s) => total + s.count, 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No work entries data available</p>
          )}
        </div>

        {/* Work Entries Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Work Entries by Priority</h3>
          {workStats?.priorityStats && workStats.priorityStats.length > 0 ? (
            <div className="space-y-4">
              {workStats.priorityStats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(stat._id)}`}>
                      {stat._id}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(stat.count / workStats.priorityStats.reduce((total, s) => total + s.count, 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No priority data available</p>
          )}
        </div>

        {/* Work Entries Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Work Entries by Category</h3>
          {workStats?.categoryStats && workStats.categoryStats.length > 0 ? (
            <div className="space-y-4">
              {workStats.categoryStats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(stat._id)}`}>
                      {stat._id}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(stat.count / workStats.categoryStats.reduce((total, s) => total + s.count, 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No category data available</p>
          )}
        </div>

        {/* Notes Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notes by Category</h3>
          {notesStats?.categoryStats && notesStats.categoryStats.length > 0 ? (
            <div className="space-y-4">
              {notesStats.categoryStats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(stat._id)}`}>
                      {stat._id}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(stat.count / notesStats.categoryStats.reduce((total, s) => total + s.count, 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No notes data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Average Completion Time</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {workStats?.avgCompletionTime ? `${Math.round(workStats.avgCompletionTime)} days` : 'N/A'}
            </p>
          </div>

          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Completion Rate</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {workStats?.completionRate ? `${Math.round(workStats.completionRate)}%` : 'N/A'}
            </p>
          </div>

          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Notes Created</h4>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {notesStats?.totalNotes || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Productivity Focus:</strong> You have {workStats?.statusStats?.find(stat => stat._id === 'In Progress')?.count || 0} tasks currently in progress.
                Consider focusing on completing high-priority items first.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Note Organization:</strong> You've created {notesStats?.totalNotes || 0} notes across {notesStats?.categoryStats?.length || 0} categories.
                Keep organizing your thoughts effectively!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

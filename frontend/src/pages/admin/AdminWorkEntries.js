import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  BriefcaseIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const AdminWorkEntries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const queryClient = useQueryClient();

  // Fetch work entries with real-time updates
  const { data: workEntriesData, isLoading } = useQuery(
    ['adminWorkEntries', searchTerm, selectedStatus, selectedCategory],
    () => adminAPI.getWorkEntries({ 
      search: searchTerm, 
      status: selectedStatus !== 'All' ? selectedStatus : undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined 
    }),
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 0,
      keepPreviousData: true,
    }
  );

  // Delete mutation
  const deleteWorkEntryMutation = useMutation(
    (id) => adminAPI.deleteWorkEntry(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminWorkEntries');
        queryClient.invalidateQueries('adminDashboard');
        toast.success('Work entry deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete work entry');
      },
    }
  );

  const handleDelete = (entry) => {
    if (window.confirm(`Are you sure you want to delete "${entry.title}"?`)) {
      deleteWorkEntryMutation.mutate(entry._id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const actualWorkEntriesData = workEntriesData?.data || workEntriesData;
  const workEntries = actualWorkEntriesData?.workEntries || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <BriefcaseIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Entries Management</h1>
            <p className="mt-2 text-gray-600">Monitor and manage all user work entries</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Entries
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, description, or user..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Entries List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Work Entries ({workEntries.length})
          </h3>
        </div>
        
        {workEntries.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {workEntries.map((entry) => (
              <div key={entry._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{entry.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                        {entry.priority} Priority
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{entry.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{entry.user?.username || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(entry.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{entry.timeSpent ? `${entry.timeSpent.toFixed(1)}h` : '0h'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>{entry.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toast.info('View details feature coming soon!')}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toast.info('Edit feature coming soon!')}
                      className="p-2 text-gray-400 hover:text-yellow-600 rounded-md hover:bg-yellow-50"
                      title="Edit Entry"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      title="Delete Entry"
                      disabled={deleteWorkEntryMutation.isLoading}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work entries found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'All' || selectedCategory !== 'All'
                ? 'Try adjusting your filters'
                : 'No work entries have been created yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkEntries;
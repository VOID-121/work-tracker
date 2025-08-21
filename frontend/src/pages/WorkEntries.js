import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { workEntriesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const WorkEntries = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch work entries with real-time updates
  const { data: workEntries, isLoading } = useQuery(
    'workEntries',
    () => workEntriesAPI.getAll(),
    {
      select: (response) => response.data.workEntries,
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    }
  );

  // Create work entry mutation
  const createMutation = useMutation(workEntriesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('workEntries');
      queryClient.invalidateQueries('adminDashboard'); // Update admin stats
      queryClient.invalidateQueries('workStats'); // Update dashboard stats
      toast.success('Work entry created successfully!');
      setShowCreateForm(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create work entry');
    },
  });

  // Update work entry mutation
  const updateMutation = useMutation(
    ({ id, data }) => workEntriesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('workEntries');
        queryClient.invalidateQueries('adminDashboard'); // Update admin stats
        queryClient.invalidateQueries('workStats'); // Update dashboard stats
        toast.success('Work entry updated successfully!');
        setEditingEntry(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update work entry');
      },
    }
  );

  // Delete work entry mutation
  const deleteMutation = useMutation(workEntriesAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('workEntries');
      toast.success('Work entry deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete work entry');
    },
  });

  const onSubmit = (data) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowCreateForm(true);
    reset({
      title: entry.title,
      description: entry.description,
      category: entry.category,
      priority: entry.priority,
      status: entry.status,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this work entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingEntry(null);
    reset();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Work Entries</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingEntry ? 'Edit Work Entry' : 'Create Work Entry'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="input-field"
                placeholder="Enter work entry title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows="3"
                className="input-field"
                placeholder="Describe what you worked on"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select {...register('category')} className="input-field">
                  <option value="Development">Development</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Research">Research</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Testing">Testing</option>
                  <option value="Planning">Planning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select {...register('priority')} className="input-field">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select {...register('status')} className="input-field">
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="btn-primary"
              >
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingEntry ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingEntry ? 'Update Entry' : 'Create Entry'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Work Entries List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Your Work Entries</h3>
        {workEntries && workEntries.length > 0 ? (
          <div className="space-y-4">
            {workEntries.map((entry) => (
              <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{entry.title}</h4>
                    <p className="text-gray-600 mt-1">{entry.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(entry.priority)}`}>
                        {entry.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      disabled={deleteMutation.isLoading}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No work entries yet.</p>
            <p className="text-sm mt-2">Click "Add Entry" to create your first work entry.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkEntries;

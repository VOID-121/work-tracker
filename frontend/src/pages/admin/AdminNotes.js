import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { PaperClipIcon as PaperClipIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const AdminNotes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const queryClient = useQueryClient();

  // Fetch notes with real-time updates
  const { data: notesData, isLoading } = useQuery(
    ['adminNotes', searchTerm, selectedCategory],
    () => adminAPI.getNotes({ 
      search: searchTerm, 
      category: selectedCategory !== 'All' ? selectedCategory : undefined 
    }),
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 0,
      keepPreviousData: true,
    }
  );

  // Delete mutation
  const deleteNoteMutation = useMutation(
    (id) => adminAPI.deleteNote(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminNotes');
        queryClient.invalidateQueries('adminDashboard');
        toast.success('Note deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete note');
      },
    }
  );

  const handleDelete = (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteNoteMutation.mutate(note._id);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Personal': 'bg-blue-100 text-blue-800',
      'Work': 'bg-green-100 text-green-800',
      'Ideas': 'bg-purple-100 text-purple-800',
      'Meeting': 'bg-yellow-100 text-yellow-800',
      'Todo': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const getColorStyle = (color) => {
    const colors = {
      'blue': 'border-l-4 border-blue-500 bg-blue-50',
      'green': 'border-l-4 border-green-500 bg-green-50',
      'yellow': 'border-l-4 border-yellow-500 bg-yellow-50',
      'red': 'border-l-4 border-red-500 bg-red-50',
      'purple': 'border-l-4 border-purple-500 bg-purple-50',
      'pink': 'border-l-4 border-pink-500 bg-pink-50',
      'indigo': 'border-l-4 border-indigo-500 bg-indigo-50',
      'gray': 'border-l-4 border-gray-500 bg-gray-50'
    };
    return colors[color] || colors['gray'];
  };

  const actualNotesData = notesData?.data || notesData;
  const notes = actualNotesData?.notes || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <DocumentTextIcon className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes Management</h1>
            <p className="mt-2 text-gray-600">View and manage all user notes</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Notes
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, content, or user..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Categories</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Ideas">Ideas</option>
              <option value="Meeting">Meeting</option>
              <option value="Todo">Todo</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`p-6 rounded-lg shadow-sm border ${getColorStyle(note.color)} hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {note.isImportant && (
                    <StarIconSolid className="h-5 w-5 text-yellow-500" />
                  )}
                  {note.isPinned && (
                    <PaperClipIconSolid className="h-5 w-5 text-blue-500" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toast.info('View details feature coming soon!')}
                    className="p-1 text-gray-400 hover:text-purple-600 rounded"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toast.info('Edit feature coming soon!')}
                    className="p-1 text-gray-400 hover:text-yellow-600 rounded"
                    title="Edit Note"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete Note"
                    disabled={deleteNoteMutation.isLoading}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {note.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {note.content}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-3 w-3" />
                  <span>{note.user?.username || 'Unknown User'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(new Date(note.createdAt), 'MMM dd')}</span>
                </div>
              </div>

              {note.reminderDate && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Reminder: {format(new Date(note.reminderDate), 'MMM dd, yyyy')}
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border">
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your filters'
                : 'No notes have been created yet'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotes;
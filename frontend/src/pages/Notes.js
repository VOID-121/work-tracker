import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { notesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { PaperClipIcon as PaperClipIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const Notes = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch notes with real-time updates
  const { data: notes, isLoading } = useQuery(
    'notes',
    () => notesAPI.getAll(),
    {
      select: (response) => response.data.notes,
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    }
  );

  // Create note mutation
  const createMutation = useMutation(notesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
      queryClient.invalidateQueries('adminDashboard'); // Update admin stats
      queryClient.invalidateQueries('notesStats'); // Update dashboard stats
      toast.success('Note created successfully!');
      setShowCreateForm(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create note');
    },
  });

  // Update note mutation
  const updateMutation = useMutation(
    ({ id, data }) => notesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        queryClient.invalidateQueries('adminDashboard'); // Update admin stats
        queryClient.invalidateQueries('notesStats'); // Update dashboard stats
        toast.success('Note updated successfully!');
        setEditingNote(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update note');
      },
    }
  );

  // Delete note mutation
  const deleteMutation = useMutation(notesAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
      toast.success('Note deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    },
  });

  // Pin note mutation
  const pinMutation = useMutation(notesAPI.pin, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to pin note');
    },
  });

  const onSubmit = (data) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowCreateForm(true);
    reset({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
      color: note.color,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePin = (id) => {
    pinMutation.mutate(id);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingNote(null);
    reset();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getColorClass = (color) => {
    switch (color) {
      case 'red': return 'border-red-200 bg-red-50';
      case 'orange': return 'border-orange-200 bg-orange-50';
      case 'yellow': return 'border-yellow-200 bg-yellow-50';
      case 'green': return 'border-green-200 bg-green-50';
      case 'blue': return 'border-blue-200 bg-blue-50';
      case 'purple': return 'border-purple-200 bg-purple-50';
      case 'pink': return 'border-pink-200 bg-pink-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingNote ? 'Edit Note' : 'Create Note'}
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
                placeholder="Enter note title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                rows="5"
                className="input-field"
                placeholder="Write your note content here..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select {...register('category')} className="input-field">
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Reminders">Reminders</option>
                  <option value="Meeting Notes">Meeting Notes</option>
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
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select {...register('color')} className="input-field">
                  <option value="default">Default</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="pink">Pink</option>
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
                    {editingNote ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingNote ? 'Update Note' : 'Create Note'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className={`border rounded-lg p-4 ${getColorClass(note.color)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 flex-1">{note.title}</h4>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handlePin(note._id)}
                      className="p-1 text-gray-400 hover:text-yellow-600"
                    >
                      {note.isPinned ? (
                        <PaperClipIconSolid className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <PaperClipIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      disabled={deleteMutation.isLoading}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {note.content}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(note.priority)}`}>
                      {note.priority}
                    </span>
                    <span className="text-gray-500">
                      {note.category}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {format(new Date(note.createdAt), 'MMM dd')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No notes yet.</p>
            <p className="text-sm mt-2">Click "Create Note" to add your first note.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;

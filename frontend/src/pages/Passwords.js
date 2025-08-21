import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  KeyIcon,
  GlobeAltIcon,
  UserIcon,
  EnvelopeIcon,
  TagIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { passwordsAPI } from '../services/api';

const Passwords = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPassword, setShowPassword] = useState({});
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch passwords
  const { data: passwordsData, isLoading } = useQuery(
    ['passwords', searchTerm, selectedCategory],
    () => passwordsAPI.getAll({ search: searchTerm, category: selectedCategory }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch password stats
  const { data: stats } = useQuery('passwordStats', passwordsAPI.getStats);

  // Mutations
  const createPasswordMutation = useMutation(passwordsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('passwords');
      queryClient.invalidateQueries('passwordStats');
      toast.success('Password saved successfully!');
      handleCancel();
    },
    onError: (error) => {
      console.error('Create password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save password';
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        errors.forEach(err => toast.error(`${err.path}: ${err.msg}`));
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const updatePasswordMutation = useMutation(
    ({ id, data }) => passwordsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('passwords');
        queryClient.invalidateQueries('passwordStats');
        toast.success('Password updated successfully!');
        handleCancel();
      },
      onError: (error) => {
        console.error('Update password error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to update password';
        const errors = error.response?.data?.errors;
        if (errors && errors.length > 0) {
          errors.forEach(err => toast.error(`${err.path}: ${err.msg}`));
        } else {
          toast.error(errorMessage);
        }
      },
    }
  );

  const deletePasswordMutation = useMutation(passwordsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('passwords');
      queryClient.invalidateQueries('passwordStats');
      toast.success('Password deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete password');
    },
  });

  const onSubmit = (data) => {
    const processedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      category: data.category || 'Other'
    };

    if (editingPassword) {
      updatePasswordMutation.mutate({ id: editingPassword._id, data: processedData });
    } else {
      createPasswordMutation.mutate(processedData);
    }
  };

  const handleEdit = (password) => {
    setEditingPassword(password);
    setValue('title', password.title);
    setValue('website', password.website || '');
    setValue('username', password.username || '');
    setValue('email', password.email || '');
    setValue('password', password.decryptedPassword);
    setValue('category', password.category);
    setValue('notes', password.notes || '');
    setValue('tags', password.tags ? password.tags.join(', ') : '');
    setShowForm(true);
  };

  const handleDelete = (password) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      deletePasswordMutation.mutate(password._id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPassword(null);
    reset({
      title: '', website: '', username: '', email: '', password: '', category: 'Other', notes: '', tags: ''
    });
  };

  const togglePasswordVisibility = (passwordId) => {
    setShowPassword(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Weak': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Strong': return 'text-green-600 bg-green-100';
      case 'Very Strong': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Social Media': return '📱';
      case 'Banking': return '🏦';
      case 'Work': return '💼';
      case 'Entertainment': return '🎮';
      case 'Shopping': return '🛒';
      case 'Email': return '📧';
      case 'Gaming': return '🎯';
      default: return '🔑';
    }
  };

  // Password Generator
  const generatePassword = (length = 16, includeSpecial = true) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = lowercase + uppercase + numbers;
    if (includeSpecial) chars += special;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setValue('password', newPassword);
    toast.success('Password generated!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <ShieldCheckIcon className="h-8 w-8 mr-3" />
                Password Manager
              </h1>
              <p className="mt-2 text-blue-100">Securely store and manage your passwords with military-grade encryption</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingPassword(null);
                reset({
                  title: '', website: '', username: '', email: '', password: '', category: 'Other', notes: '', tags: ''
                });
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-lg text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Password
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {stats && (
          <div className="mt-8">
            <div className="flex items-center mb-6">
              <ChartBarIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Password Analytics</h2>
            </div>
            
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Passwords</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalPasswords}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <KeyIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Strong Passwords</p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.strengthStats?.filter(s => s._id === 'Strong' || s._id === 'Very Strong').reduce((acc, curr) => acc + curr.count, 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Weak Passwords</p>
                    <p className="text-3xl font-bold text-yellow-900">
                      {stats.strengthStats?.filter(s => s._id === 'Weak' || s._id === 'Medium').reduce((acc, curr) => acc + curr.count, 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Categories</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.categoryStats?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <TagIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Categories Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TagIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Password Categories
                </h3>
                <div className="space-y-4">
                  {stats.categoryStats?.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getCategoryIcon(stat._id)}</span>
                        <span className="text-sm font-medium text-gray-700">{stat._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(stat.count / stats.totalPasswords) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-right">{stat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Analysis */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Security Analysis
                </h3>
                <div className="space-y-4">
                  {stats.strengthStats?.map((stat, index) => {
                    const colors = {
                      'Very Strong': 'bg-blue-600',
                      'Strong': 'bg-green-600',
                      'Medium': 'bg-yellow-600',
                      'Weak': 'bg-red-600'
                    };
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{stat._id}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${colors[stat._id]} h-2 rounded-full`}
                              style={{ width: `${(stat.count / stats.totalPasswords) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-right">{stat.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Security Score */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Security Score</span>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const strongCount = stats.strengthStats?.filter(s => s._id === 'Strong' || s._id === 'Very Strong').reduce((acc, curr) => acc + curr.count, 0) || 0;
                        const score = Math.round((strongCount / stats.totalPasswords) * 100) || 0;
                        return (
                          <>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {score}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:ring-2 transition-all"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:ring-2 appearance-none bg-white transition-all min-w-[200px]"
            >
              <option value="All">All Categories</option>
              <option value="Social Media">📱 Social Media</option>
              <option value="Banking">🏦 Banking</option>
              <option value="Work">💼 Work</option>
              <option value="Entertainment">🎮 Entertainment</option>
              <option value="Shopping">🛒 Shopping</option>
              <option value="Email">📧 Email</option>
              <option value="Gaming">🎯 Gaming</option>
              <option value="Other">🔑 Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Password Form */}
      {showForm && (
        <div className="mb-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <KeyIcon className="h-6 w-6 text-blue-600 mr-2" />
              {editingPassword ? 'Edit Password' : 'Add New Password'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="Other"
                >
                  <option value="Social Media">Social Media</option>
                  <option value="Banking">Banking</option>
                  <option value="Work">Work</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Email">Email</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  {...register('website')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  {...register('username')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="flex space-x-2">
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                    title="Generate Password"
                  >
                    Generate
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPasswordMutation.isLoading || updatePasswordMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {createPasswordMutation.isLoading || updatePasswordMutation.isLoading ? 'Saving...' : (editingPassword ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Passwords List */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl border">
        {passwordsData?.passwords?.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <KeyIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No passwords</h3>
            <p className="mt-2 text-gray-500">Get started by creating your first secure password.</p>
            <div className="mt-8">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Password
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {passwordsData?.passwords?.map((password) => (
              <div key={password._id} className="px-6 py-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getCategoryIcon(password.category)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {password.title}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStrengthColor(password.strength)}`}>
                          {password.strength}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        {password.website && (
                          <div className="flex items-center">
                            <GlobeAltIcon className="h-4 w-4 mr-1" />
                            <span className="truncate">{password.website}</span>
                          </div>
                        )}
                        {password.username && (
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span className="truncate">{password.username}</span>
                          </div>
                        )}
                        {password.email && (
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            <span className="truncate">{password.email}</span>
                          </div>
                        )}
                      </div>
                      {password.tags && password.tags.length > 0 && (
                        <div className="mt-2 flex items-center space-x-2">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          {password.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-50 rounded-lg px-3 py-2">
                      <input
                        type={showPassword[password._id] ? 'text' : 'password'}
                        value={password.decryptedPassword}
                        readOnly
                        className="text-sm text-gray-900 bg-transparent border-none focus:outline-none font-mono"
                        style={{ width: showPassword[password._id] ? 'auto' : '80px' }}
                      />
                      <button
                        onClick={() => togglePasswordVisibility(password._id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword[password._id] ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(password.decryptedPassword)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy password"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleEdit(password)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit password"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(password)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete password"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {passwordsData?.pagination && passwordsData.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((passwordsData.pagination.currentPage - 1) * passwordsData.pagination.itemsPerPage) + 1} to{' '}
            {Math.min(passwordsData.pagination.currentPage * passwordsData.pagination.itemsPerPage, passwordsData.pagination.totalItems)} of{' '}
            {passwordsData.pagination.totalItems} results
          </div>
        </div>
      )}
    </div>
  );
};

export default Passwords;

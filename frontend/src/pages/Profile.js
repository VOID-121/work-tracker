import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, workEntriesAPI, notesAPI, passwordsAPI } from '../services/api';
import { 
  UserIcon, 
  CameraIcon, 
  PencilIcon, 
  KeyIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  // Fetch user statistics with real-time updates
  const { data: workStats } = useQuery('userWorkStats', workEntriesAPI.getStats, {
    refetchInterval: 5000, // Refetch every 5 seconds for real-time
    staleTime: 0, // Always consider data stale
    select: (response) => response.data || response, // Handle different response formats
  });
  const { data: notesStats } = useQuery('userNotesStats', notesAPI.getStats, {
    refetchInterval: 5000,
    staleTime: 0,
    select: (response) => response.data || response,
  });
  const { data: passwordStats } = useQuery('userPasswordStats', passwordsAPI.getStats, {
    refetchInterval: 5000,
    staleTime: 0,
    select: (response) => response.data || response,
  });

  const updateProfileMutation = useMutation(authAPI.updateProfile, {
    onSuccess: (data) => {
      // Update the user data in the auth context
      queryClient.setQueryData('user', data.data);
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['userWorkStats']);
      queryClient.invalidateQueries(['userNotesStats']);
      queryClient.invalidateQueries(['userPasswordStats']);
      setShowEditForm(false);
      reset();
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation(
    (passwordData) => authAPI.changePassword(passwordData),
    {
      onSuccess: () => {
        setShowPasswordForm(false);
        resetPassword();
        toast.success('Password changed successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to change password');
      },
    }
  );

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const response = await authAPI.uploadAvatar(formData);
      // Update user data immediately
      queryClient.setQueryData('user', response.data);
      queryClient.invalidateQueries(['user']);
      toast.success('Avatar uploaded successfully!');
      setShowAvatarUpload(false);
      // Force refresh to show new avatar
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getDaysActive = () => {
    if (!user?.createdAt) return 0;
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account settings and view statistics</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                {user?.profile?.avatar ? (
                  <img 
                    src={`http://localhost:5000${user.profile.avatar}`} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-blue-100">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                  className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 hover:scale-110"
                >
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.profile?.firstName && user?.profile?.lastName 
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user?.username
                  }
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 shadow-sm ${
                  user?.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                }`}>
                  {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>

            {/* Avatar Upload Form */}
            {showAvatarUpload && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Upload New Avatar</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadingAvatar && (
                  <p className="text-sm text-blue-600 mt-2">Uploading...</p>
                )}
                <button
                  onClick={() => setShowAvatarUpload(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              
              {user?.profile && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.profile.firstName || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.profile.lastName || 'Not set'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
              Account Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">
                  {workStats?.totalWorkEntries || workStats?.statusStats?.reduce((total, stat) => total + stat.count, 0) || workStats?.total || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">Work Entries</p>
                <p className="text-xs text-gray-500">Updated {new Date().toLocaleTimeString()}</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">
                  {notesStats?.data?.totalNotes || notesStats?.totalNotes || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">Notes</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <CalendarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600">
                  {getDaysActive()}
                </p>
                <p className="text-sm text-gray-600 font-medium">Days Active</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <ShieldCheckIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-yellow-600">
                  {passwordStats?.totalPasswords || passwordStats?.total || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">Passwords</p>
                <p className="text-xs text-gray-500">Updated {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-600 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowEditForm(true);
                  setValue('firstName', user?.profile?.firstName || '');
                  setValue('lastName', user?.profile?.lastName || '');
                  setValue('department', user?.profile?.department || '');
                  setValue('position', user?.profile?.position || '');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <PencilIcon className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <KeyIcon className="h-5 w-5" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Stats refreshed</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Work entries: {workStats?.totalWorkEntries || workStats?.total || workStats?.statusStats?.reduce((total, stat) => total + stat.count, 0) || 0}</p>
                      <p className="text-xs text-gray-500">Current total - Updated {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Notes: {notesStats?.totalNotes || notesStats?.total || 0}</p>
                      <p className="text-xs text-gray-500">Current total - Updated {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Passwords: {passwordStats?.totalPasswords || passwordStats?.total || 0}</p>
                      <p className="text-xs text-gray-500">Current total - Updated {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  {...register('department')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  {...register('position')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter position"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    reset();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit((data) => changePasswordMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value, formValues) => value === formValues.newPassword || 'Passwords do not match'
                  })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    resetPassword();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

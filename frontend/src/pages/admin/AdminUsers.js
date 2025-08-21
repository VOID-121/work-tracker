import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  UsersIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch users
  const { data: usersData, isLoading } = useQuery(
    ['adminUsers', searchTerm],
    () => adminAPI.getUsers({ search: searchTerm }),
    {
      keepPreviousData: true,
    }
  );

  // Mutations
  const createUserMutation = useMutation(adminAPI.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminUsers');
      queryClient.invalidateQueries('adminDashboard');
      toast.success('User created successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation(
    ({ id, data }) => adminAPI.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries('adminDashboard');
        toast.success('User updated successfully!');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      },
    }
  );

  const deleteUserMutation = useMutation(adminAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminUsers');
      queryClient.invalidateQueries('adminDashboard');
      toast.success('User deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const onSubmit = (data) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('firstName', user.profile?.firstName || '');
    setValue('lastName', user.profile?.lastName || '');
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    reset();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300';
      case 'user':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const actualUsersData = usersData?.data || usersData;
  const users = actualUsersData?.users || [];

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
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg mr-4">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="mt-2 text-blue-100">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:ring-2 transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setEditingUser(null);
                setShowModal(true);
                reset({ username: '', email: '', password: '', role: 'user' });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{users.length}</span> users found
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl border">
        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <UsersIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-gray-500">No users match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profile?.avatar ? (
                          <img
                            src={`http://localhost:5000${user.profile.avatar}`}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile?.firstName && user.profile?.lastName
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : user.username
                            }
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit user"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete user"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
                  Edit User
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  {...register('username', { required: 'Username is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {createUserMutation.isLoading || updateUserMutation.isLoading 
                    ? (editingUser ? 'Updating...' : 'Creating...') 
                    : (editingUser ? 'Update User' : 'Create User')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

import React from 'react';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button className="btn-primary">+ Add User</button>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">All Users</h3>
        <div className="text-center py-12 text-gray-500">
          <p>User management interface coming soon...</p>
          <p className="text-sm mt-2">You'll be able to manage users, roles, and permissions here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

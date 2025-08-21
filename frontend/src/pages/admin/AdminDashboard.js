import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Work Entries</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Admin Features</h3>
        <div className="text-center py-12 text-gray-500">
          <p>Admin dashboard with statistics and management tools coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

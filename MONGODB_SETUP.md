# MongoDB Atlas Setup Guide

## Quick Setup Steps:

### 1. Create MongoDB Atlas Account
- Go to https://cloud.mongodb.com/
- Sign up for a free account
- Create a new project called "WorkTracker"

### 2. Create a Free Cluster
- Click "Build a Database"
- Choose "FREE" (M0 Sandbox)
- Select a cloud provider and region (closest to you)
- Name your cluster "WorkTrackerCluster"

### 3. Configure Database Access
- Create a database user:
  - Username: `worktracker-user`
  - Password: Generate a secure password (save it!)
  - Role: "Atlas Admin" or "Read and write to any database"

### 4. Configure Network Access
- Add IP addresses that can access your database
- For development, you can use `0.0.0.0/0` (allow all IPs)
- For production, restrict to specific IPs

### 5. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Select "Node.js" and version "4.1 or later"
- Copy the connection string
- It will look like: `mongodb+srv://worktracker-user:<password>@worktrackercluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 6. Add to Vercel Environment Variables
Replace `<password>` with your actual password and add this as `MONGODB_URI` in Vercel.

## Default Admin Credentials
After setup, you can create an admin user with:
- Email: admin@example.com
- Password: admin123

## Demo User Credentials  
- Email: user@example.com
- Password: user123

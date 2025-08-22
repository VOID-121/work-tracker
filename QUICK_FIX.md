# 🚨 QUICK FIX - Login/Register Issue

## Problem: Missing Environment Variables in Vercel

## SOLUTION: Add these 3 environment variables in Vercel Dashboard:

### 1. Delete the current "worktrack" variable (it's wrong)

### 2. Add these NEW variables:

**Variable 1:**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://worktracker:worktracker123@cluster0.5z8zj.mongodb.net/worktracker?retryWrites=true&w=majority`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Name: `JWT_SECRET`  
- Value: `super-secret-jwt-key-work-tracker-2024-production-ready`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 3:**
- Name: `NODE_ENV`
- Value: `production`
- Environments: ✅ Production

## After adding variables:
1. The app will auto-redeploy
2. Login with: **admin@example.com** / **admin123**
3. Or register a new account

## If login still fails:
- Try registering a new user first
- The database will auto-create users when you register

## Test Credentials (after I create them):
- **Admin:** admin@example.com / admin123
- **Demo User:** user@example.com / user123

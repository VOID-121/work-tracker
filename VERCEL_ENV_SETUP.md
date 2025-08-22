# Vercel Environment Variables Setup

## Add these environment variables in your Vercel dashboard:

### 1. MONGODB_URI
**Value:** `mongodb+srv://demo:demo123@cluster0.5z8zj.mongodb.net/worktracker?retryWrites=true&w=majority`
**Environments:** ✅ Production, ✅ Preview, ✅ Development

### 2. JWT_SECRET  
**Value:** `super-secret-jwt-key-for-work-tracker-app-2024-make-this-random-in-production`
**Environments:** ✅ Production, ✅ Preview, ✅ Development

### 3. NODE_ENV
**Value:** `production`
**Environments:** ✅ Production

## Steps:
1. In the Vercel dashboard that just opened, click "Add New"
2. Enter the Name and Value from above
3. Select all environments (Production, Preview, Development)
4. Click "Save"
5. Repeat for each variable

## After adding variables:
- The app will automatically redeploy
- You can login with: admin@example.com / admin123
- Or demo user: user@example.com / user123

## Quick Copy-Paste Values:

**MONGODB_URI:**
```
mongodb+srv://demo:demo123@cluster0.5z8zj.mongodb.net/worktracker?retryWrites=true&w=majority
```

**JWT_SECRET:**
```
super-secret-jwt-key-for-work-tracker-app-2024-make-this-random-in-production
```

**NODE_ENV:**
```
production
```

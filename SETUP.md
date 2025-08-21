# 🚀 Quick Setup Guide

Follow these steps to get your Work Tracker application running:

## 📋 Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - **Local MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud) - [Sign up here](https://www.mongodb.com/cloud/atlas)
3. **Git** - [Download here](https://git-scm.com/)

## ⚡ Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/work-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**For MongoDB Atlas users:** Replace `MONGODB_URI` with your Atlas connection string.

### 3. Start the Application

**Option A: Start Both Servers Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option B: Start Backend Only (for API testing)**
```bash
cd backend
npm run dev
```

### 4. Create Demo Users (Optional)

To create demo admin and user accounts:
```bash
cd backend
npm run create-admin
```

This creates:
- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/api (basic endpoint info)

## 🔧 Database Setup

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env` file

## 📱 First Time Usage

1. **Register a new account** or use demo accounts
2. **Login** to access the dashboard
3. **Create your first work entry** to track tasks
4. **Add important notes** for reminders
5. **Explore admin features** (if you're an admin)

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

**MongoDB connection failed:**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings

**Dependencies issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Make sure backend is running on port 5000
- Check proxy setting in frontend/package.json

### Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/work-tracker
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
```

**Frontend (optional .env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 Security Notes

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Set strong passwords** for admin accounts
4. **Configure MongoDB authentication** for production

## 📈 Production Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Environment Setup
- Use production database
- Set secure JWT secret
- Configure proper CORS origins
- Use HTTPS
- Set NODE_ENV=production

### Hosting Options
- **Frontend:** Netlify, Vercel, GitHub Pages
- **Backend:** Heroku, DigitalOcean, AWS
- **Database:** MongoDB Atlas, AWS DocumentDB

## 💡 Development Tips

1. **Use nodemon** for backend auto-restart: `npm run dev`
2. **React DevTools** for debugging frontend
3. **MongoDB Compass** for database management
4. **Postman** for API testing
5. **VS Code** with REST Client extension

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Open an issue on GitHub
- Check the troubleshooting section above

---

**Happy coding! 🎉**

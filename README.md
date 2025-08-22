# 🚀 Work Tracker App

A modern, full-stack Daily Work Tracker and Notes Manager built with React, Node.js, and MongoDB.

![Work Tracker App](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-lightgreen)

## 🌟 Features

### 👨‍💼 User Features
- **📊 Dashboard**: Beautiful overview with real-time statistics
- **📝 Work Entries**: Track daily tasks and activities with categories
- **📋 Notes Management**: Organize important notes with categories
- **🔐 Password Manager**: Secure password storage with encryption
- **👤 Profile Management**: Update profile information and avatar
- **📱 Responsive Design**: Works perfectly on all devices

### 🛡️ Admin Features
- **📊 Admin Dashboard**: System overview with health monitoring
- **👥 User Management**: Create, edit, and manage user accounts
- **📈 Real-time Analytics**: Live data synchronization across all components
- **🔍 Advanced Search**: Filter and search across all data
- **⚡ System Health**: Database connection status and server monitoring

### 🎨 Design Features
- **✨ Modern UI**: Beautiful glassmorphism and gradient designs
- **🌙 Responsive Layout**: Optimized for desktop and mobile
- **⚡ Real-time Updates**: Live data synchronization with React Query
- **🚀 Fast Performance**: Optimized loading and caching

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks and Context API
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Heroicons** for beautiful icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt
- **Express Validator** for input validation
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VOID-121/work-tracker-app.git
   cd work-tracker-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/work-tracker
   JWT_SECRET=your-secret-key-here
   ```

4. **Run the application**
   ```bash
   # From root directory - runs both frontend and backend
   npm run dev

   # Or run separately:
   # Backend (from backend directory)
   npm run dev

   # Frontend (from frontend directory) 
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
work-tracker-app/
├── backend/                 # Node.js/Express backend
│   ├── middleware/         # Authentication middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── uploads/           # File uploads
│   └── server.js          # Server entry point
├── frontend/               # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── App.js         # App entry point
├── .gitignore
├── vercel.json            # Vercel deployment config
├── package.json           # Root package.json
└── README.md
```

## 🌐 Deployment

### Vercel Deployment
1. **Push to GitHub**
2. **Connect to Vercel**: Visit [vercel.com](https://vercel.com) and import your repository
3. **Environment Variables**: Add your environment variables in Vercel dashboard
4. **Deploy**: Vercel will automatically deploy your app

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret
```

## 🔐 Default Admin Account

After setting up, create an admin account:
```bash
cd backend
npm run create-admin
```

## 📸 Screenshots

### Dashboard
Beautiful overview with real-time statistics and quick actions.

### Admin Panel
Comprehensive admin dashboard with user management and system monitoring.

### Work Entries
Intuitive work tracking with categories and search functionality.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Rakibul Islam**
- GitHub: [@VOID-121](https://github.com/VOID-121)
- University: Ahsanullah University of Science and Technology
- Study: Computer Science and Engineering
- Location: Dhaka, Bangladesh

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Tailwind CSS for the utility-first CSS framework
- All the open-source contributors who made this project possible

---

⭐ **Star this repository if you found it helpful!**
bla bla bla
bla bla bla
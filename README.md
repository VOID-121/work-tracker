# Work Tracker - Daily Work & Notes Manager

A comprehensive web application built with React.js frontend and Node.js/Express backend for tracking daily work activities and managing important notes with admin panel functionality.

## 🚀 Features

### User Features
- **Authentication System**: Secure login/register with JWT tokens
- **Dashboard**: Overview of work entries, notes, and statistics
- **Work Entries Management**: Create, edit, delete, and categorize daily work tasks
- **Notes Management**: Create, organize, pin, archive important notes
- **Time Tracking**: Track time spent on work entries
- **Categories & Tags**: Organize work and notes with custom categories
- **Priority Levels**: Set priority levels for tasks and notes
- **Search & Filter**: Find work entries and notes quickly
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Features
- **Admin Dashboard**: System-wide statistics and insights
- **User Management**: View, edit, activate/deactivate users
- **Content Oversight**: View and manage all work entries and notes
- **Role Management**: Assign admin/user roles
- **System Analytics**: Track platform usage and activity

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router 6** - Client-side routing
- **React Query** - Data fetching and state management
- **React Hook Form** - Form handling
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
work-tracker-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config.js        # Configuration
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/work-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the backend server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The backend will be running on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will be running on http://localhost:3000

### Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas (cloud)
2. **Create a database** named `work-tracker`
3. The application will automatically create collections when you start using it

## 👤 Default Accounts

For testing purposes, you can create these demo accounts:

**Admin Account:**
- Email: admin@example.com
- Password: admin123
- Role: Admin

**User Account:**
- Email: user@example.com
- Password: user123
- Role: User

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Work Entries
- `GET /api/work-entries` - Get user's work entries
- `POST /api/work-entries` - Create new work entry
- `PUT /api/work-entries/:id` - Update work entry
- `DELETE /api/work-entries/:id` - Delete work entry
- `GET /api/work-entries/stats/summary` - Get work statistics

### Notes
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PUT /api/notes/:id/pin` - Pin/unpin note
- `PUT /api/notes/:id/archive` - Archive/unarchive note

### Admin (Admin only)
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/work-entries` - Get all work entries
- `GET /api/admin/notes` - Get all notes

## 🎨 Features Highlights

### Work Entry Management
- Create detailed work entries with categories (Development, Meeting, Research, etc.)
- Set priority levels (Low, Medium, High, Urgent)
- Track status (Not Started, In Progress, Completed, On Hold)
- Time tracking with start/end times
- Tags for better organization

### Notes System
- Rich text notes with categories (Personal, Work, Ideas, etc.)
- Color coding for visual organization
- Pin important notes to the top
- Archive old notes
- Reminder dates for follow-up
- Search through notes content

### Admin Panel
- Comprehensive user management
- System-wide analytics and statistics
- Content moderation capabilities
- Role-based access control

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend (no build needed, runs with Node.js)
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Tailwind CSS for the beautiful styling system
- All the open-source contributors who made this project possible

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Happy Tracking! 🎯**

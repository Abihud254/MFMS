# Micro-finance Management System 

A comprehensive RESTful API for managing chama (savings group) operations built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control (Admin/Member)
- 👥 **Member Management** - CRUD operations for chama members with profile photos
- 💰 **Contribution Tracking** - Record and track member contributions
- 🏦 **Loan Management** - Complete loan lifecycle from application to repayment
- 📅 **Meeting Management** - Schedule meetings, track attendance, record minutes
- 📱 **SMS Notifications** - Payment reminders via Africa's Talking or Twilio
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 🔍 **Search & Filter** - Advanced querying capabilities
- 📈 **Reports** - Generate financial and performance reports

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **SMS Service:** Africa's Talking / Twilio (To be integrated in future updates)
- **Validation:** express-validator
- **Security:** helmet, cors, express-rate-limit

## Prerequisites

- Node.js v18 or higher
- MongoDB v5.0 or higher (Local or MongoDB Atlas)
- npm or yarn package manager
- Africa's Talking or Twilio account (for SMS notifications: To be integrated in future updates)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd chama-backend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chama-management
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chama?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# SMS (Africa's Talking)
AFRICAS_TALKING_API_KEY=your-api-key
AFRICAS_TALKING_USERNAME=your-username

# OR Twilio
# TWILIO_ACCOUNT_SID=your-sid
# TWILIO_AUTH_TOKEN=your-token
# TWILIO_PHONE_NUMBER=+1234567890

# Admin Credentials
ADMIN_EMAIL=admin@chama.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `MONGODB_URI` in `.env`

### 5. Run the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

### 6. Seed the database (Optional)

To populate the database with sample data:

```bash
npm run seed
```

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update profile
PUT    /api/auth/change-password - Change password
POST   /api/auth/logout         - Logout user
```

#### Members (Admin only for create/update/delete)
```
GET    /api/members             - Get all members
POST   /api/members             - Create member
GET    /api/members/:id         - Get member details
PUT    /api/members/:id         - Update member
DELETE /api/members/:id         - Delete member
PUT    /api/members/:id/photo   - Update member photo
```

#### Contributions
```
GET    /api/contributions       - Get all contributions
POST   /api/contributions       - Record contribution
GET    /api/contributions/:id   - Get contribution details
PUT    /api/contributions/:id   - Update contribution
DELETE /api/contributions/:id   - Delete contribution
GET    /api/contributions/member/:memberId - Get member contributions
GET    /api/contributions/stats - Get contribution statistics
```

#### Loans
```
GET    /api/loans               - Get all loans
POST   /api/loans               - Create loan application
GET    /api/loans/:id           - Get loan details
PUT    /api/loans/:id           - Update loan
PUT    /api/loans/:id/approve   - Approve loan (Admin)
PUT    /api/loans/:id/reject    - Reject loan (Admin)
POST   /api/loans/:id/repayment - Record loan repayment
GET    /api/loans/member/:memberId - Get member loans
GET    /api/loans/stats         - Get loan statistics
```

#### Meetings
```
GET    /api/meetings            - Get all meetings
POST   /api/meetings            - Schedule meeting
GET    /api/meetings/:id        - Get meeting details
PUT    /api/meetings/:id        - Update meeting
DELETE /api/meetings/:id        - Delete meeting
PUT    /api/meetings/:id/attendance - Mark attendance
PUT    /api/meetings/:id/minutes - Add meeting minutes
```

#### Notifications
```
GET    /api/notifications       - Get all notifications
POST   /api/notifications/send  - Send notification
POST   /api/notifications/payment-reminder - Send payment reminder
POST   /api/notifications/loan-reminder - Send loan reminder
POST   /api/notifications/meeting-reminder - Send meeting reminder
GET    /api/notifications/history - Get notification history
```

#### Dashboard
```
GET    /api/dashboard/stats     - Get dashboard statistics
GET    /api/dashboard/recent-activities - Get recent activities
GET    /api/dashboard/charts    - Get chart data
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```


## Testing

```bash
# Run tests (if configured)
npm test
```

## Deployment

### Using PM2 (Recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name chama-api

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```



## Project Structure

```
chama-backend/
├── config/
│   └── database.js         # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── memberController.js
│   ├── contributionController.js
│   ├── loanController.js
│   ├── meetingController.js
│   ├── notificationController.js
│   └── dashboardController.js
├── middleware/
│   └── auth.js             # Authentication & authorization
├── models/
│   ├── User.js
│   ├── Member.js
│   ├── Contribution.js
│   ├── Loan.js
│   ├── Meeting.js
│   └── Notification.js
├── routes/
│   ├── auth.js
│   ├── members.js
│   ├── contributions.js
│   ├── loans.js
│   ├── meetings.js
│   ├── notifications.js
│   └── dashboard.js
├── scripts/
│   └── seedDatabase.js     # Seed sample data
├── services/
│   └── smsService.js       # SMS sending logic
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js               # Entry point
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongod --version

# Check MongoDB service status
sudo systemctl status mongod
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email brigthwritershub@gmail.com or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- User authentication with JWT
- Member management
- Contribution tracking
- Loan management with interest calculations
- Meeting scheduling and attendance
- SMS notifications
- Dashboard analytics
- Role-based access control

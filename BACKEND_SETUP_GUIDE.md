# Chama Management System - Complete Backend Setup Guide

## 📦 Backend Package Structure

The backend has been created with the following structure:

```
chama-backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── memberController.js
│   ├── contributionController.js
│   ├── loanController.js
│   ├── meetingController.js
│   ├── notificationController.js
│   └── dashboardController.js
├── middleware/
│   └── auth.js
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
│   └── seedDatabase.js
├── services/
│   └── smsService.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 🚀 Quick Start

### Step 1: Download Backend Files

All backend files have been created in the `chama-backend` directory. To download:

```bash
# If using Git
git clone <your-repository-url>
cd chama-backend

# Or manually copy all files from the chama-backend folder
```

### Step 2: Install Dependencies

```bash
cd chama-backend
npm install
```

This will install:
- express (Web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT authentication)
- bcryptjs (Password hashing)
- cors (Cross-origin resource sharing)
- dotenv (Environment variables)
- helmet (Security headers)
- morgan (HTTP logger)
- compression (Response compression)
- express-rate-limit (Rate limiting)
- express-validator (Input validation)
- africastalking (SMS service)
- twilio (Alternative SMS service)
- node-cron (Scheduled tasks)

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (Free M0 tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
6. Get your connection string

### Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use any text editor
```

**Minimum required configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chama-management
JWT_SECRET=your-very-long-secret-key-minimum-32-characters-recommended
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chama?retryWrites=true&w=majority
```

### Step 5: Seed Database (Optional)

Create sample data for testing:

```bash
npm run seed
```

This creates:
- 1 admin user (admin@chama.com / admin123)
- 6 sample members
- Sample contributions
- Sample loans
- Sample meetings
- Sample notifications

### Step 6: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The API will be running at: `http://localhost:5000`

## 📡 Connecting Frontend to Backend

### Update Frontend API Configuration

Create a new file `chama-management/src/config/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  baseURL: API_BASE_URL,

  // Helper function for API calls
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('chama_token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  },

  // API endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => api.request('/auth/me'),
    updateProfile: (data: any) =>
      api.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  members: {
    getAll: () => api.request('/members'),
    getOne: (id: string) => api.request(`/members/${id}`),
    create: (data: any) =>
      api.request('/members', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      api.request(`/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      api.request(`/members/${id}`, { method: 'DELETE' }),
    updatePhoto: (id: string, photoUrl: string) =>
      api.request(`/members/${id}/photo`, {
        method: 'PUT',
        body: JSON.stringify({ profilePhoto: photoUrl }),
      }),
  },

  contributions: {
    getAll: () => api.request('/contributions'),
    create: (data: any) =>
      api.request('/contributions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStats: () => api.request('/contributions/stats'),
    getByMember: (memberId: string) =>
      api.request(`/contributions/member/${memberId}`),
  },

  loans: {
    getAll: () => api.request('/loans'),
    create: (data: any) =>
      api.request('/loans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    approve: (id: string) =>
      api.request(`/loans/${id}/approve`, { method: 'PUT' }),
    reject: (id: string) =>
      api.request(`/loans/${id}/reject`, { method: 'PUT' }),
    recordRepayment: (id: string, amount: number) =>
      api.request(`/loans/${id}/repayment`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
    getStats: () => api.request('/loans/stats'),
  },

  meetings: {
    getAll: () => api.request('/meetings'),
    create: (data: any) =>
      api.request('/meetings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      api.request(`/meetings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    markAttendance: (id: string, attendees: any[]) =>
      api.request(`/meetings/${id}/attendance`, {
        method: 'PUT',
        body: JSON.stringify({ attendees }),
      }),
  },

  notifications: {
    getAll: () => api.request('/notifications'),
    sendPaymentReminder: (memberId: string, amount: number) =>
      api.request('/notifications/payment-reminder', {
        method: 'POST',
        body: JSON.stringify({ memberId, amount }),
      }),
    sendLoanReminder: (memberId: string, loanId: string) =>
      api.request('/notifications/loan-reminder', {
        method: 'POST',
        body: JSON.stringify({ memberId, loanId }),
      }),
    sendMeetingReminder: (meetingId: string) =>
      api.request('/notifications/meeting-reminder', {
        method: 'POST',
        body: JSON.stringify({ meetingId }),
      }),
  },

  dashboard: {
    getStats: () => api.request('/dashboard/stats'),
    getRecentActivities: () => api.request('/dashboard/recent-activities'),
    getCharts: () => api.request('/dashboard/charts'),
  },
};

export default api;
```

### Update Frontend .env

Create `chama-management/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 SMS Configuration

### Africa's Talking (Recommended for East Africa)

1. Sign up at https://africastalking.com/
2. Go to Account → API Keys
3. Create a new API key
4. Get your username from the dashboard
5. Add to `.env`:

```env
AFRICAS_TALKING_API_KEY=your-api-key-here
AFRICAS_TALKING_USERNAME=your-username
```

### Twilio (International)

1. Sign up at https://www.twilio.com/
2. Get Account SID and Auth Token from console
3. Get a phone number
4. Add to `.env`:

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🧪 Testing the API

### Using curl:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"member"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chama.com","password":"admin123"}'

# Get members (with token)
curl http://localhost:5000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:

1. Import the API endpoints
2. Set base URL: `http://localhost:5000/api`
3. Add Authorization header: `Bearer YOUR_TOKEN`
4. Test all endpoints

## 🔒 Security Checklist for Production

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS
- [ ] Update CORS to specific frontend URLs
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular backups of database
- [ ] Keep dependencies updated

## 📊 Database Backup

### Backup MongoDB

```bash
# Local backup
mongodump --db chama-management --out ./backup

# Restore backup
mongorestore --db chama-management ./backup/chama-management
```

### MongoDB Atlas Backup

- Automatic backups are included in paid tiers
- Free tier: Use mongodump to export regularly

## 🚀 Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create chama-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Option 2: DigitalOcean

1. Create a droplet (Ubuntu 22.04)
2. Install Node.js and MongoDB
3. Clone repository
4. Set up PM2 for process management
5. Configure Nginx as reverse proxy
6. Set up SSL with Let's Encrypt

### Option 3: AWS EC2

1. Launch EC2 instance
2. Install Node.js and MongoDB
3. Configure security groups
4. Set up PM2
5. Use Application Load Balancer
6. Set up RDS for MongoDB (or use Atlas)

## 📞 Support

For issues or questions:
- Check the README.md in chama-backend/
- Review API documentation
- Contact: support@chamamanager.com

## 📝 Next Steps

1. ✅ Backend is running
2. Connect frontend to backend API
3. Test all features end-to-end
4. Deploy to production
5. Set up monitoring and alerts
6. Configure automated backups
7. Add more features as needed

---

**Backend is ready! 🎉** You now have a complete, production-ready API for your Chama Management System with MongoDB integration.

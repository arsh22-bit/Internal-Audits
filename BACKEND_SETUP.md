# Internal Audits Backend - MongoDB Integration

## Overview
This project now has a complete backend setup with MongoDB integration for the Tata Advanced Systems Internal Audit Management System.

## What Was Built

### 1. **Environment Configuration**
- **File**: `.env.local`
- **Purpose**: Contains MongoDB URI and other configuration variables
- **Key Variables**:
  - `MONGODB_URI`: MongoDB connection string
  - `JWT_SECRET`: Secret for JWT token generation
  - `NEXTAUTH_SECRET`: Next.js authentication secret

### 2. **Database Connection**
- **File**: `src/lib/mongodb.ts`
- **Purpose**: MongoDB connection utility with connection caching for Next.js
- **Features**:
  - Automatic connection management
  - Hot reload support
  - Error handling

### 3. **User Authentication System**
- **User Model**: `src/models/User.ts`
  - Password hashing with bcrypt
  - Role-based access control (admin, auditor, manager)
  - Department-based organization
  - Email validation and uniqueness
- **JWT Utilities**: `src/lib/jwt.ts`
  - Token generation and verification
  - Authorization header parsing
- **Auth Middleware**: `src/lib/auth-middleware.ts`
  - Request authentication
  - Role-based permissions
  - Audit access control

### 4. **API Routes**
#### Authentication Routes
- **POST /api/auth/login**: User login
- **POST /api/auth/register**: User registration
- **GET /api/auth/me**: Get current user profile

#### Audit Routes
- **GET /api/audits**: List audits with filtering and pagination
- **POST /api/audits**: Create new audit
- **GET /api/audits/[id]**: Get specific audit
- **PUT /api/audits/[id]**: Update audit
- **DELETE /api/audits/[id]**: Delete audit (soft delete)

### 5. **Data Models**
#### User Model
- Email, password, name, role, department
- Password hashing and comparison
- Timestamps and soft delete support

#### Audit Model
- Title, description, type, department
- Status tracking (draft, active, completed, archived)
- Risk level assessment
- Audit items with detailed tracking
- Progress calculation
- User assignments (auditor, manager)

### 6. **Frontend Integration**
- **API Client**: `src/lib/api-client.ts`
  - Centralized API communication
  - Token management
  - Error handling
- **Updated Authentication**: Real API calls instead of mock data
- **Enhanced Dashboard**: Integrated with the existing audit form system

## Setup Instructions

### 1. Install Dependencies
The required packages are already installed:
```bash
npm install
```

Key packages added:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token handling
- `@types/bcryptjs` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/internal-audits
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a cluster and database
3. Get the connection string
4. Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internal-audits
```

### 3. Environment Variables
Update `.env.local` with your specific values:
```env
# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string

# JWT Configuration  
JWT_SECRET=your-secure-jwt-secret-key

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
NODE_ENV=development
```

### 4. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### First Time Setup
1. Go to `http://localhost:3000`
2. Click "Create Account" to register the first user
3. Fill in your details (first user will be assigned "auditor" role by default)
4. After registration, you'll be automatically logged in and redirected to `/audit`

### User Roles
- **Admin**: Full access to all audits and user management
- **Manager**: Access to audits in their department
- **Auditor**: Access to their own audits and department audits

### Features Available
- **User Authentication**: Login/Register with real database storage
- **Audit Categories**: Six predefined audit categories with detailed forms
- **Progress Tracking**: Real-time form completion tracking
- **Role-based Access**: Different permissions based on user roles
- **Department Organization**: Users organized by departments

## API Endpoints Summary

### Authentication
```
POST /api/auth/login
POST /api/auth/register  
GET /api/auth/me
```

### Audits
```
GET /api/audits?page=1&limit=10&status=active&department=Engineering
POST /api/audits
GET /api/audits/[id]
PUT /api/audits/[id]
DELETE /api/audits/[id]
```

## Database Schema

### Users Collection
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: "admin" | "auditor" | "manager",
  department: String (required),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Audits Collection
```javascript
{
  title: String (required),
  description: String (required),
  auditType: "internal" | "external" | "compliance" | "quality" | "safety",
  department: String (required),
  auditor: ObjectId (ref: User),
  manager: ObjectId (ref: User),
  status: "draft" | "active" | "completed" | "archived",
  riskLevel: "low" | "medium" | "high" | "critical",
  startDate: Date (required),
  endDate: Date,
  completedDate: Date,
  items: [AuditItemSchema],
  overallScore: Number (0-100),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. **Create Admin User**: Manually update the first user's role to "admin" in the database if needed
2. **Add More Audit Types**: Extend the audit system with additional categories
3. **Reports**: Build reporting functionality using the audit data
4. **File Uploads**: Add support for uploading audit evidence files
5. **Email Notifications**: Implement notifications for audit assignments and updates

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ Secure API endpoints
- ✅ Environment variable protection

The backend is now fully functional and ready for production use!

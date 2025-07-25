# Backend Structure

```
loan-backend/
├── server.js                    # Main server entry point
├── package.json                 # Dependencies and scripts
├── .env                        # Environment variables
├── config/
│   └── database.js             # MongoDB connection configuration
├── models/
│   ├── User.js                 # User schema and model
│   ├── LoanApplication.js      # Loan application schema and model
│   └── Document.js             # Document schema and model
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   └── upload.js               # File upload middleware (multer)
├── routes/
│   ├── auth.js                 # Authentication routes (register, login, profile)
│   ├── loans.js                # Loan application routes
│   ├── documents.js            # Document management routes
│   └── admin.js                # Admin utility routes
├── utils/
│   └── userUtils.js            # User utility functions
└── uploads/                    # File upload directory (created automatically)
```

## File Descriptions

### Core Files

- **server.js**: Main application entry point that sets up Express server, middleware, and routes
- **package.json**: Project dependencies and npm scripts
- **.env**: Environment variables (PORT, MONGODB_URI, JWT_SECRET)

### Configuration

- **config/database.js**: MongoDB connection setup using Mongoose

### Models (Database Schemas)

- **models/User.js**: User model with authentication fields
- **models/LoanApplication.js**: Comprehensive loan application schema
- **models/Document.js**: Document storage schema for file uploads

### Middleware

- **middleware/auth.js**: JWT token verification and authentication
- **middleware/upload.js**: Multer configuration for file uploads

### Routes (API Endpoints)

- **routes/auth.js**: User authentication endpoints
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/verify` - Token verification
  - `PUT /api/auth/profile` - Profile updates

- **routes/loans.js**: Loan application management
  - `POST /api/loans/apply` - Submit loan application
  - `GET /api/loans/my-applications` - Get user's applications
  - `GET /api/loans/application/:id` - Get specific application

- **routes/documents.js**: Document upload and management
  - `POST /api/documents/upload` - Upload documents
  - `GET /api/documents/:applicationId` - Get uploaded documents
  - `POST /api/documents/complete/:applicationId` - Complete document submission

- **routes/admin.js**: Administrative functions
  - `POST /api/admin/sync-user-data` - Sync user data across collections

### Utilities

- **utils/userUtils.js**: Helper functions for user data management across collections

## Environment Variables Required

Create a `.env` file in the root directory with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loan_management
JWT_SECRET=your_jwt_secret_key_here
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required environment variables

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Key Features Maintained

- ✅ Complete user authentication system
- ✅ Comprehensive loan application management
- ✅ Document upload and verification
- ✅ File storage with multer
- ✅ User data synchronization across collections
- ✅ JWT-based authentication
- ✅ Database transactions for data consistency
- ✅ Admin utilities
- ✅ Error handling and validation

## API Endpoints Summary

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login` 
- `GET /api/auth/verify`
- `PUT /api/auth/profile`

### Loans
- `POST /api/loans/apply`
- `GET /api/loans/my-applications`
- `GET /api/loans/application/:applicationId`

### Documents
- `POST /api/documents/upload`
- `GET /api/documents/:applicationId`
- `POST /api/documents/complete/:applicationId`

### Admin
- `POST /api/admin/sync-user-data`
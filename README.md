# Email Verification System

This system provides email verification for user signup and account deletion in a dual-database (SQL and MongoDB) authentication system.

## Features

- **Email Verification on Signup**:
  - Verification link sent to user's email
  - Account remains inactive until verified
  - Verification token expires after 24 hours

- **Email Confirmation for Account Deletion**:
  - Confirmation link sent to user's email
  - Account deleted only after confirmation
  - Deletion token expires after 1 hour

## Setup Instructions

1. **Configure Environment Variables**:
   Edit the `.env` file in the backend directory:

   ```
   # Email configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL for redirection links
   FRONTEND_URL=http://localhost:3000
   ```

   **Note**: For Gmail, you need to use an "App Password" rather than your regular password. See [GMAIL_SETUP.md](GMAIL_SETUP.md) for detailed instructions on obtaining an App Password.

2. **Install Dependencies**:
   ```
   cd backend
   npm install
   ```

3. **Start the Server**:
   ```
   npm start
   ```

## Troubleshooting Email Issues

If emails aren't being sent:

1. Check that you've set up proper Gmail credentials in `.env`
2. Verify that your Gmail account has 2-factor authentication enabled and you're using an App Password
3. Look at the server logs for specific error messages
4. If all else fails, you might be hitting Gmail's sending limits or your account might have security restrictions

For Gmail setup details, refer to [GMAIL_SETUP.md](GMAIL_SETUP.md).

## API Endpoints

### Authentication

- **POST /api/auth/signup**: Register a new user and send verification email
- **GET /api/auth/verify-email/:userId/:token**: Verify email with token
- **POST /api/auth/signin**: Login with credentials
- **POST /api/auth/resend-verification**: Resend verification email

### Account Management

- **POST /api/auth/request-deletion**: Request account deletion
- **GET /api/auth/confirm-deletion/:userId/:token**: Confirm account deletion

## Frontend Integration

For the frontend, you'll need to create the following pages:

1. **Email Verification Page** (`/verify-email/:userId/:token`)
2. **Account Deletion Confirmation Page** (`/confirm-deletion/:userId/:token`)

These pages should call the corresponding API endpoints to complete the verification or deletion process.

## Security Considerations

- Tokens are securely generated using Node.js crypto module
- All tokens have expiration times
- Passwords are hashed using bcrypt before storage 
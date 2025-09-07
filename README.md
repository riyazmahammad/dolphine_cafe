# CafeteriaHub - Local JSON Version

A modern Angular café management system with email verification and password reset functionality, operating entirely with local JSON data storage.

## Features

### Admin Portal
- Dashboard with real-time statistics
- Menu management (CRUD operations)
- Order management and status updates
- User management

### Employee Portal
- Browse menu with categories and search
- Shopping cart functionality
- Order placement and tracking
- Order history with filtering

### Authentication System
- Email verification with OTP
- Password reset functionality
- Role-based access control
- Persistent login sessions
- Mock email system for demo

### Deployment Architecture
- Single codebase for multiple deployments
- Subdomain-based portal separation
- Theme customization per portal
- Environment-based configuration

## Technical Implementation

### Local Data Storage
- All data stored in browser's localStorage
- No backend API dependencies
- Automatic data persistence
- Real-time UI updates

### Data Management
- Centralized DataService for all operations
- Reactive data streams using RxJS
- Simulated network delays for realistic UX
- CRUD operations on local JSON data

### Enhanced Authentication
- Email verification with 6-digit OTP
- Password reset with OTP validation
- Account activation workflow
- Secure token management
- Role-based portal access

## Demo Accounts

- **Admin**: admin@cafe.com (any password) - Pre-verified
- **Employee**: john@cafe.com (any password) - Pre-verified

## New User Registration Flow

1. **Sign Up** → Enter details and submit
2. **Email Verification** → Enter 6-digit OTP (displayed in success message)
3. **Account Activated** → Automatic login and portal redirect

## Password Reset Flow

1. **Forgot Password** → Enter email address
2. **Verify OTP** → Enter 6-digit code (displayed in success message)
3. **Reset Password** → Create new password
4. **Login** → Use new credentials

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:4200`

## Subdomain Deployment Structure

For production deployment with subdomains:

- **Main Portal**: `cafeteriahub.com` - Landing page and authentication
- **Admin Portal**: `admin.cafeteriahub.com` - Admin dashboard and management
- **Employee Portal**: `employee.cafeteriahub.com` - Employee menu and orders

The application automatically detects the subdomain and applies appropriate theming and navigation.

## Data Structure

The application uses an enhanced JSON structure stored in localStorage:

```json
{
  "users": [...],
  "menuItems": [...],
  "orders": [...],
  "otpCodes": {...},
  "passwordResetTokens": {...},
  "nextUserId": 3,
  "nextMenuItemId": 6,
  "nextOrderId": 1
}
```

## Key Benefits

- **No Backend Required**: Runs entirely in the browser
- **Instant Setup**: No database or server configuration needed
- **Persistent Data**: Data survives browser refreshes
- **Real-time Updates**: All changes reflect immediately
- **Production-Ready UI**: Professional design and user experience
- **Secure Authentication**: Email verification and password reset
- **Multi-Portal Architecture**: Subdomain-based deployment ready
- **Responsive Design**: Works perfectly on all devices
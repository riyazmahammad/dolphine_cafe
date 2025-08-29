# CafeteriaHub - Local JSON Version

A modern Angular café management system that operates entirely with local JSON data storage.

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

### Authentication
- Mock authentication system
- Role-based access control (Admin/Employee)
- Persistent login sessions

## Demo Accounts

- **Admin**: admin@cafe.com (any password)
- **Employee**: john@cafe.com (any password)

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

## Data Structure

The application uses a structured JSON format stored in localStorage:

```json
{
  "users": [...],
  "menuItems": [...],
  "orders": [...],
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
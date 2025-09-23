# Public Transport Management Backend

A comprehensive Node.js/Express application for managing public transport operations including routes, schedules, bookings, and user management with role-based access control.

## 🚀 Features

- **Dual Architecture**: REST APIs + Server-rendered web interfaces using EJS
- **Role-based Access**: Admin and User dashboards with appropriate permissions
- **Booking Management**: Complete booking workflow with passenger manifests
- **Route & Schedule Management**: Comprehensive transport route and timing management
- **Session-based Authentication**: Secure authentication with MongoDB session storage
- **Responsive UI**: Bootstrap 5-based responsive design

## 📁 Project Structure

```
├── app.js                 # Main application entry point
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables (create from .env.example)
├── docs/                  # Documentation
│   └── API-README.md      # Detailed API documentation
├── scripts/               # Utility and maintenance scripts
│   ├── debug/             # Debugging and diagnostic scripts
│   ├── migration/         # Data migration scripts
│   ├── utilities/         # General utility scripts
│   └── README.md          # Scripts documentation
├── public/                # Static assets (CSS, JS, images)
├── src/
│   ├── config/            # Database and configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication and validation middleware
│   ├── models/            # Mongoose data models
│   ├── routes/            # Express route definitions
│   ├── utils/             # Utility functions
│   └── views/             # EJS templates
│       ├── admin/         # Admin dashboard views
│       ├── auth/          # Authentication views
│       ├── user/          # User dashboard views
│       └── partials/      # Reusable template components
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd public-transport-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and session secret
   ```

4. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Application: http://localhost:3000
   - Admin Login: Use `/auth/create-admin` to create initial admin
   - User Registration: Available on home page

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node scripts/utilities/create-test-user.js` - Create test users
- `node scripts/debug/diagnose-bookings.js` - Diagnose booking issues

## 📚 Key Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: express-session with MongoDB storage
- **Templating**: EJS (Embedded JavaScript)
- **UI Framework**: Bootstrap 5 + Bootstrap Icons
- **Password Security**: bcryptjs with salt rounds
## 🎯 Main Features

### Authentication & Authorization
- Session-based authentication (not JWT)
- Role-based access (admin/user)
- Protected routes with middleware
- Automatic role-based redirects

### Booking System
- Multi-step booking workflow
- Route and schedule selection
- Passenger manifest collection
- Payment processing simulation
- Booking history and management

### Admin Management
- Dashboard with statistics
- User management
- Route and schedule management
- Booking oversight and customer details
- System-wide analytics

### User Experience
- Personal booking dashboard
- Route filtering by date/time preferences
- Booking history and upcoming trips
- Route-specific booking from dashboard

## 🔍 For Developers

See `/docs/API-README.md` for detailed API documentation and development guidelines.

## 📝 License

This project is for educational/demonstration purposes.
  - `GET /api/routes/:id` - Get a route by ID
  - `PUT /api/routes/:id` - Update a route by ID
  - `DELETE /api/routes/:id` - Delete a route by ID

- **Schedules**
  - `POST /api/schedules` - Create a new schedule
  - `GET /api/schedules` - Get all schedules
  - `GET /api/schedules/:id` - Get a schedule by ID
  - `PUT /api/schedules/:id` - Update a schedule by ID
  - `DELETE /api/schedules/:id` - Delete a schedule by ID

- **Users**
  - `POST /api/users` - Create a new user
  - `GET /api/users` - Get all users
  - `GET /api/users/:id` - Get a user by ID
  - `PUT /api/users/:id` - Update a user by ID
  - `DELETE /api/users/:id` - Delete a user by ID

- **Bookings**
  - `POST /api/bookings` - Create a new booking
  - `GET /api/bookings` - Get all bookings
  - `GET /api/bookings/:id` - Get a booking by ID
  - `PUT /api/bookings/:id` - Update a booking by ID
  - `DELETE /api/bookings/:id` - Delete a booking by ID

## Admin Dashboard

The admin dashboard is built using EJS and can be accessed at `http://localhost:3000/admin/dashboard`. It provides a user-friendly interface for managing routes, schedules, users, and bookings.

## Error Handling

The application includes middleware for error handling and input validation to ensure robust and secure API operations.

## Contributing

Feel free to fork the repository and submit pull requests for any improvements or features you would like to add.

## License

This project is licensed under the MIT License.
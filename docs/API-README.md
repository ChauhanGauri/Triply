# Public Transport Management System

This project is a backend implementation of a Public Transport Management System using Node.js, Express, and MongoDB. It provides APIs for managing routes, schedules, users, and bookings, along with an admin dashboard for easy management.

## Project Structure

```
public-transport-management-backend
├── src
│   ├── app.js
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── routeController.js
│   │   ├── scheduleController.js
│   │   ├── userController.js
│   │   └── bookingController.js
│   ├── middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models
│   │   ├── Route.js
│   │   ├── Schedule.js
│   │   ├── User.js
│   │   └── Booking.js
│   ├── routes
│   │   ├── routeRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── userRoutes.js
│   │   └── bookingRoutes.js
│   ├── views
│   │   ├── admin
│   │   │   └── dashboard.ejs
│   │   └── partials
│   │       └── header.ejs
│   └── utils
│       └── apiResponses.js
├── package.json
├── .env
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd public-transport-management-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The server will run on `http://localhost:3000`.

## API Endpoints

- **Routes**
  - `POST /api/routes` - Create a new route
  - `GET /api/routes` - Get all routes
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
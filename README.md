# Budget App

A modern web application for tracking personal income and expenses. Built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Track income and expenses
- Categorize transactions
- View budget overview with charts
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd budget-app
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/budget-app
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Transactions
- GET /api/transactions - Get all transactions
- POST /api/transactions - Create a new transaction
- PUT /api/transactions/:id - Update a transaction
- DELETE /api/transactions/:id - Delete a transaction

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - Chart.js
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT for authentication

## License

MIT 
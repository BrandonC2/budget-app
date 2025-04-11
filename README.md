# Budget Tracking Application

A full-stack budget tracking application built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

```
budget-app/
├── client/             # React frontend
│   ├── public/         # Static files
│   └── src/            # React source code
│       ├── components/ # UI components
│       ├── context/    # React Context API
│       └── services/   # API services
├── server/             # Express backend
│   ├── config/         # Configuration files
│   ├── models/         # Mongoose models
│   └── routes/         # API routes
└── package.json        # Root package.json for scripts
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install-all
```

This will install dependencies for the root project, client, and server.

### Development

To run both client and server in development mode:

```bash
npm run dev
```

To run only the server:

```bash
npm run server
```

To run only the client:

```bash
npm run client
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Features

- User authentication
- Budget tracking
- Transaction management
- Visual reports and charts

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
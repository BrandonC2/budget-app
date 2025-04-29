# Budget App

A full-stack budget tracking application built with the MERN stack. Track your income and expenses, categorize transactions, and visualize your financial data.

## Features

- User authentication (register/login)
- Dashboard with financial overview
- Transaction management
- Financial reports and charts
- Responsive design

## Project Structure

```
budget-app/
├── client/             # React frontend
└── server/             # Express backend
```

## Tech Stack

- **Frontend**: React, Material-UI, Chart.js
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/BrandonC2/budget-app.git
cd budget-app

# Install dependencies
npm run install-all
```

### Environment Setup

Create `.env` in the root directory:
```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Usage

```bash
# Run both client and server
npm run dev

# Run server only
npm run server

# Run client only
npm run client
```

Access at:
- Frontend: http://localhost:3000
- API: http://localhost:5001

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Transactions**: `/api/transactions` (GET, POST, PUT, DELETE)

## License

MIT

## Contact

Brandon Chau - [GitHub](https://github.com/BrandonC2)

Project: [https://github.com/BrandonC2/budget-app](https://github.com/BrandonC2/budget-app) 

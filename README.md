# Budget App

![Budget App](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

A comprehensive full-stack budget tracking application built with the MERN stack (MongoDB, Express, React, Node.js). Easily track your income and expenses, categorize transactions, and visualize your financial data.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## ✨ Features

- **User Authentication**: Secure registration and login
- **Dashboard Overview**: Visual summary of income, expenses, and balance
- **Transaction Management**: Add, edit, delete, and categorize transactions
- **Financial Reports**: View spending patterns with interactive charts
- **Responsive Design**: Works on desktop and mobile devices
- **Data Security**: JWT authentication and secure data storage

## 🏗️ Project Structure

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

## 🛠️ Tech Stack

### Frontend
- **React**: UI library
- **Material-UI**: Component library
- **Chart.js**: Data visualization
- **React Router**: Navigation
- **Axios**: API requests

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/BrandonC2/budget-app.git
   cd budget-app
   ```

2. Install dependencies
   ```bash
   npm run install-all
   ```

### Configuration

1. Create a `.env` file in the root directory with:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret_key
   ```

2. Create a `.env` file in the client directory with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## 💻 Usage

Start both server and client in development mode:
```bash
npm run dev
```

Server only:
```bash
npm run server
```

Client only:
```bash
npm run client
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get user info (requires authentication)

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction summary

## 📷 Screenshots

*Coming soon*

## 🔮 Roadmap

- [ ] Transaction categories customization
- [ ] Budget setting and alerts
- [ ] Data export functionality
- [ ] Dark mode support
- [ ] Mobile application

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

Brandon Chau - [GitHub](https://github.com/BrandonC2)

Project Link: [https://github.com/BrandonC2/budget-app](https://github.com/BrandonC2/budget-app) 

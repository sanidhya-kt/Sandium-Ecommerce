# 🛒 Sandium Ecommerce

A modern, full-stack E-Commerce platform built with **Node.js**, **Express**, **MongoDB**, **React**, and **Vite**. Features authentication, product search & filtering, order management, and secure API architecture.

---

## 🚀 Features

- 🔐 **User Authentication & Authorization**: Secure JWT-based authentication with HTTP-only cookies & role-based access control (Admin / User).
- 📦 **Product Management**: Full CRUD operations for products with category tagging, stock tracking, and image handling.
- 🔎 **Advanced Search & Filtering**: Pagination, keyword search, price range filtering, and category selection.
- 🛍️ **Cart & Order Processing**: Order lifecycle management with total pricing and status tracking.
- ⚡ **Modern Frontend**: Fast React frontend powered by Vite with component-driven architecture.
- 🛠️ **Robust Error Handling**: Centralized async error catching and custom error handler middleware.

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcrypt` password hashing
- **Utilities**: `cookie-parser`, `cors`, `dotenv`, `nodemailer`, `validator`

### **Frontend**
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)

---

## 📂 Project Structure

```
Sandium-Ecommerce/
├── backend/
│   ├── config/          # Database connection & env configuration
│   ├── controllers/     # Route request handlers (User, Product, Order)
│   ├── middleware/      # Auth & error handling middlewares
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express route definitions
│   ├── utils/           # JWT, email, API features, error class
│   ├── app.js           # Express app initialization & middleware
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/             # React application source code
│   ├── index.html       # Vite HTML template
│   └── vite.config.js   # Vite configuration
└── README.md
```

---

## ⚡ Quick Start

### **1. Prerequisites**
- Node.js (v16+ recommended)
- MongoDB server (Local instance or MongoDB Atlas cluster)

### **2. Environment Setup**
Create a `config.env` file inside `backend/config/` (refer to `config.env.example`):

```env
PORT=5001
DB_URI=mongodb://localhost:27017/SandiumEcommerce
JWT_SECRET_KEY=your_secret_jwt_key
JWT_EXPIRE=5d
COOKIE_EXPIRE=5
FRONTEND_URL=http://localhost:5173
```

### **3. Install & Run Backend**
```bash
cd backend
npm install
npm run dev
```

### **4. Install & Run Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

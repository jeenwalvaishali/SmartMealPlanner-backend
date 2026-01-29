### 📌 Project Overview

**Smart Meal Planner & Recipe Platform**

A cross-platform application (Android + Web) that allows users to discover recipes, plan weekly meals, and manage content via a secure admin interface.

---

### 🏗️ Architecture

```
Android App (Kotlin)
React Web App (TypeScript)
        │
        └── REST APIs (Node.js + Express)
                    │
                MongoDB
```

---

### 🔐 Authentication & Authorization

* JWT-based authentication
* Secure password hashing using bcrypt
* Role-based access control (USER, ADMIN)
* Protected routes using middleware

---

### 📦 Tech Stack

**Backend**

* Node.js, Express
* MongoDB, Mongoose
* JWT, bcrypt

---

### 📁 Folder Structure

```
src/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middleware/
 ├── utils/
 ├── config/
 ├── app.js
 └── server.js
```

---

### 🔗 API Endpoints (Week 1)

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

### 🚀 Getting Started

```bash
npm install
npm run dev
```

---

### 🔮 Upcoming Features

* Recipe management (CRUD)
* Meal planner
* Ratings & reviews
* Android & Web clients

---


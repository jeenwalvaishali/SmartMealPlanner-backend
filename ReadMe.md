### 📌 Project Overview

## 🍽️ Smart Meal Planner & Recipe Platform

A full-stack cross-platform recipe platform (Android + Web) that allows users to discover recipes, rate them, search with advanced filters, upload images, and manage content via a secure admin interface.

---

## 🏗️ System Architecture

```
Android App (Kotlin - MVVM)
React Web App (JavaScript)
        │
        └── REST APIs (Node.js + Express)
                    │
                MongoDB (Indexed)
                    │
           Cloudinary (Image Storage)
```

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Secure password hashing using bcrypt
* Role-based access control (USER, ADMIN)
* Ownership-based update permissions
* Protected routes using middleware

---

## ⭐ Core Features

### 👤 Authentication

* Register / Login
* Get current user profile
* Secure JWT token validation

### 🍳 Recipe Management

* Create recipe (ADMIN)
* Update recipe (Owner or ADMIN)
* Delete recipe (ADMIN)
* Get all recipes (pagination + filtering)
* Get recipe by ID (with populated creator)

### ⭐ Rating System

* Authenticated users can rate recipes (1–5)
* Users can update their previous rating
* Automatic average rating calculation
* Rating-based filtering in search

### 🔍 Advanced Search

* Keyword search (title + description)
* Filter by cuisine
* Filter by ingredient
* Filter by minimum rating
* Sorting (rating, newest, prep time)
* Pagination with metadata
* Optimized MongoDB queries with indexing

### 📸 Image Upload

* Image upload via Cloudinary
* Secure Multer middleware integration
* Stores `imageUrl` and `public_id`
* Automatic image cleanup on delete
* Supports image replacement lifecycle

---

## 📦 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* bcrypt
* Cloudinary
* Multer

### Mobile

* Kotlin
* MVVM Architecture
* Retrofit
* Coroutines
* LiveData

### Web

* React (JavaScript)
* REST API integration

---

## 📁 Backend Folder Structure

```
src/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middleware/
 ├── config/
 ├── utils/
 ├── app.js
 └── server.js
```

---

## 🔗 Key API Endpoints

### 🔐 Auth

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

### 🍳 Recipes

```http
POST   /recipes              (ADMIN)
GET    /recipes
GET    /recipes/:id
PUT    /recipes/:id          (Owner or ADMIN)
DELETE /recipes/:id          (ADMIN)
```

### ⭐ Rating

```http
POST /recipes/:id/rate
```

### 🔍 Search

```http
GET /recipes/search
```

### 📸 Image Upload

```http
POST /recipes/upload
```

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

---

## 📈 Production-Ready Considerations

* Input validation
* Pagination limits for performance protection
* Indexed fields for search optimization
* Secure role enforcement
* Image lifecycle management
* Lean queries for read optimization

---

## 🔮 Upcoming Enhancements

* Weekly meal planner
* Recipe bookmarking
* Full Android & React client integration
* API testing with Jest
* Deployment (Render / AWS)

---



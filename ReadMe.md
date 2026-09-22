### 📌 Project Overview

## 🍽️ Smart Meal Planner & Recipe Platform

A full-stack cross-platform recipe platform (Android + Web) that allows users to discover recipes, rate them, search with advanced filters, upload images, generate meal plans, save favorites, and manage content via a secure admin interface.

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
* Recommended recipes and recipe of the week

### ⭐ Rating System

* Authenticated users can rate recipes (1–5)
* Users can update their previous rating
* Automatic average rating calculation
* Rating-based filtering in search

### ❤️ Favorites

* Authenticated users can add recipes to favorites
* Remove recipes from favorites
* Get the authenticated user's favorite recipes

### 🔍 Advanced Search

* Keyword search (title + description)
* Filter by cuisine, ingredient, and minimum rating
* Filter by meal type and nutrition values
* Sorting (rating, newest, prep time)
* Pagination with metadata
* Optimized MongoDB queries with indexing

### 📸 Image Upload

* Image upload via Cloudinary
* Secure Multer middleware integration
* Stores `imageUrl` and `imagePublicId`
* Automatic image cleanup on delete
* Supports image replacement lifecycle

### 📅 Meal Planning

* Generate a weekly meal plan for the authenticated user
* Filter plans by diet type, calories, cuisine, and cooking time
* Save one plan per user per week
* Retrieve the user's saved plan for the current week
* Populated recipe details in saved meal plans

### 🤖 AI Meal Assistant

* Chat with an AI assistant using the user's meal plan and preferences
* Provide controlled context including compatible recipes, calories, and cooking times
* Replace a selected meal using an AI-selected compatible recipe
* Validate AI recipe selections against real database candidates
* Use Ollama with the `llama3.2` model

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
* Ollama (`llama3.2`)

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
 ├── services/
 ├── utils/
 ├── app.js
 └── server.js
```

---

## 🔗 Key API Endpoints

All endpoints are prefixed with `/api`. Protected endpoints require:

```http
Authorization: Bearer <token>
```

### 🔐 Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me                         (Protected)
```

### 🍳 Recipes

```http
POST   /api/recipes                        (ADMIN)
GET    /api/recipes                        (Public)
GET    /api/recipes/search                 (Public)
GET    /api/recipes/categories             (Public)
GET    /api/recipes/recommended            (Public)
GET    /api/recipes/week                   (Public)
GET    /api/recipes/:id                    (Public)
PUT    /api/recipes/:id                    (Owner or ADMIN)
DELETE /api/recipes/:id                    (ADMIN)
```

### ⭐ Ratings and Favorites

```http
POST   /api/recipes/:id/rate                (Protected)
POST   /api/recipes/favorites/:id           (Protected)
DELETE /api/recipes/favorites/:id           (Protected)
GET    /api/recipes/favorites               (Protected)
```

### 🔍 Search Filters

```http
GET /api/recipes?page=1&limit=20&dietType=vegetarian&mealTypes=LUNCH,DINNER
GET /api/recipes/search?keyword=chicken&cuisine=Indian&sort=rating
```

### 📸 Image Upload

```http
POST /api/recipes/upload                   (Protected)
```

Send the image as `multipart/form-data` using the field name `image`. The maximum file size is 5 MB.

### 📅 Meal Plans

```http
POST /api/meal-plans/generate              (Protected)
GET  /api/meal-plans                       (Protected)
POST /api/meal-plans/:mealPlanId/replace   (Protected)
```

Generate request body:

```json
{
    "dietType": "vegetarian",
    "dailyCalories": 2000,
    "mealsPerDay": 3,
    "cuisine": "Indian",
    "maxCookingTime": 30
}
```

The `GET /api/meal-plans` endpoint returns the authenticated user's saved plan for the current week. It returns `404` when no plan has been saved for the current week.

Meal replacement request body:

```json
{
    "day": "Monday",
    "mealType": "BREAKFAST"
}
```

### 🤖 AI Assistant

```http
POST /api/ai/chat                         (Protected)
```

Request body:

```json
{
    "message": "What can I replace my Monday breakfast with?"
}
```

Success response:

```json
{
    "success": true,
    "answer": "..."
}
```

The chat endpoint uses the authenticated user's current meal plan, preferences, and compatible recipes as controlled AI context. Responses are returned as a single JSON response; streaming and server-side chat history are not currently implemented.

---

## 🚀 Getting Started

```bash
npm install
npm start
```

For development with automatic restart:

```bash
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

### Ollama Setup

Install Ollama from [ollama.com/download/windows](https://ollama.com/download/windows), then ensure the Ollama server is running and the model is available:

```bash
ollama serve
ollama pull llama3.2
```

If Ollama is already running, do not start a second server. The backend calls:

```text
http://localhost:11434/api/generate
```

### Android and Postman URLs

For Postman on the same computer, use:

```text
http://localhost:5000
```

For the Android emulator, use:

```text
http://10.0.2.2:5000
```

For a physical Android device, use the computer's local IPv4 address, for example `http://192.168.1.10:5000`, and keep both devices on the same network.

---

## 📈 Production-Ready Considerations

* Input validation
* Pagination limits for performance protection
* Indexed fields for search optimization
* Secure role enforcement
* Image lifecycle management
* Lean queries for read optimization

---


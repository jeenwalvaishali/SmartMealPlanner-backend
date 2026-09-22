# 🍽️ Smart Meal Planner — Backend API

A full-stack meal planning and recipe platform backend built with **Node.js, Express.js, MongoDB, and REST APIs**.

The backend powers the SmartMealPlanner Android and React applications and provides authentication, recipe management, advanced search, ratings, favorites, image uploads, personalized meal planning, AI-assisted meal conversations, and AI-powered meal replacement.

---

## 📌 Project Overview

SmartMealPlanner is a cross-platform recipe and meal-planning platform consisting of:

* 📱 Android application built with Kotlin and MVVM
* 🌐 React web application
* ⚙️ Node.js + Express REST API
* 🛠️ React admin panel
* 🗄️ MongoDB database
* 📸 Cloudinary image storage
* 🤖 Ollama-powered AI meal assistant

The backend acts as the central API layer connecting the client applications with the database, image storage, authentication system, and AI service.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │      Android App         │
                    │     Kotlin + MVVM        │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │       React Web App      │
                    │        JavaScript        │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌──────────────────────────┐
                    │    Node.js + Express     │
                    │       Backend API        │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐     ┌─────────────┐    ┌─────────────┐
       │  MongoDB   │     │  Cloudinary │    │   Ollama    │
       │  Database  │     │    Images   │    │  llama3.2   │
       └────────────┘     └─────────────┘    └─────────────┘
```

---

# 🔐 Authentication & Authorization

The API implements token-based authentication and role-based authorization.

### Security Features

* JWT-based authentication
* Password hashing using `bcryptjs`
* Role-based access control
* `USER` and `ADMIN` roles
* Protected API routes
* Ownership-based update permissions
* JWT validation middleware
* Authenticated user context through `req.user`

---

# ⭐ Core Features

## 👤 Authentication

* User registration
* User login
* Retrieve authenticated user profile
* JWT token validation
* Protected routes

---

## 🍳 Recipe Management

* Create recipes — ADMIN
* Update recipes — Owner or ADMIN
* Delete recipes — ADMIN
* Retrieve all recipes
* Pagination
* Filtering
* Retrieve recipe by ID
* Retrieve recipe categories
* Recommended recipes
* Recipe of the week
* Creator information through populated references

---

## ⭐ Rating System

Authenticated users can:

* Rate recipes from 1–5
* Update an existing rating
* View rating information
* Filter recipes using rating criteria

The backend calculates and maintains recipe rating information.

---

## ❤️ Favorites

Authenticated users can:

* Add recipes to favorites
* Remove recipes from favorites
* Retrieve their favorite recipes

---

## 🔍 Advanced Recipe Search

The recipe API supports multiple search and filtering options.

### Supported functionality

* Keyword search
* Search by recipe title
* Search by description
* Cuisine filtering
* Ingredient filtering
* Minimum rating filtering
* Meal-type filtering
* Nutrition-based filtering
* Sorting
* Pagination
* Pagination metadata

### Example

```http
GET /api/recipes?page=1&limit=20&dietType=vegetarian&mealTypes=LUNCH,DINNER
```

```http
GET /api/recipes/search?keyword=chicken&cuisine=Indian&sort=rating
```

MongoDB indexes are used to improve query performance for supported search/filter operations.

---

# 📸 Image Upload

Recipe images are uploaded using **Multer + Cloudinary**.

### Features

* Cloudinary-based image storage
* Multipart form-data uploads
* JPG, JPEG, and PNG support
* Maximum file size of 5 MB
* Stores image URL and Cloudinary public ID
* Image replacement support
* Automatic image cleanup during recipe deletion/replacement

### Upload Endpoint

```http
POST /api/recipes/upload
```

The request must use:

```text
Content-Type: multipart/form-data
```

with the field:

```text
image
```

---

# 📅 Personalized Meal Planning

Users can generate personalized weekly meal plans based on their preferences.

### Supported preferences

* Diet type
* Daily calorie target
* Meals per day
* Cuisine
* Maximum cooking time

### Example request

```http
POST /api/meal-plans/generate
```

```json
{
  "dietType": "vegetarian",
  "dailyCalories": 2000,
  "mealsPerDay": 3,
  "cuisine": "Indian",
  "maxCookingTime": 30
}
```

The backend validates meal-plan parameters before generating the plan.

For example:

* Daily calories must be positive
* Meals per day must be between 1 and 4
* Cooking time must be non-negative

---

## 💾 Saved Meal Plans

Authenticated users can retrieve their saved meal plan for the current week.

```http
GET /api/meal-plans
```

If no meal plan exists for the current week, the API returns:

```http
404
```

with an appropriate response message.

---

# 🔄 AI-Powered Meal Replacement

Users can replace an existing meal with a compatible alternative.

```http
POST /api/meal-plans/:mealPlanId/replace
```

Example request:

```json
{
  "day": "Monday",
  "mealType": "BREAKFAST"
}
```

### Replacement flow

```text
User selects meal
        │
        ▼
Backend retrieves meal plan
        │
        ▼
Find compatible recipes
        │
        ▼
Create controlled candidate list
        │
        ▼
Send candidates to AI
        │
        ▼
AI selects one candidate
        │
        ▼
Backend validates AI selection
        │
        ▼
Update meal plan
        │
        ▼
Return replacement recipe
```

The AI is not allowed to directly select arbitrary database records.

The backend validates the AI-generated recipe ID/title against the candidate recipes before updating the meal plan.

This prevents an invalid or hallucinated recipe selection from being persisted.

---

# 🤖 AI Meal Assistant

SmartMealPlanner includes an AI-powered conversational assistant using **Ollama and the `llama3.2` model**.

### Endpoint

```http
POST /api/ai/chat
```

### Example request

```json
{
  "message": "What can I replace my Monday breakfast with?"
}
```

### Example response

```json
{
  "success": true,
  "answer": "..."
}
```

---

## 🧠 Controlled AI Context

The AI assistant does not receive unrestricted database access.

The backend constructs a controlled context containing:

### User preferences

```text
Diet
Cuisine
Daily calories
Meals per day
Maximum cooking time
```

### Current meal plan

```text
Day
Meal type
Recipe
Calories
Cooking time
```

### Compatible recipes

The backend filters compatible recipes and provides a controlled candidate list to the AI.

The AI is instructed to use only this context and not invent recipe details.

---

## 🤖 AI Technology

```text
Android / React Client
          │
          ▼
POST /api/ai/chat
          │
          ▼
Node.js Backend
          │
          ├── Current Meal Plan
          ├── User Preferences
          └── Compatible Recipes
          │
          ▼
     Ollama API
          │
          ▼
       llama3.2
          │
          ▼
     JSON Response
```

The backend communicates with the local Ollama API:

```text
http://localhost:11434/api/generate
```

The current implementation uses:

```text
model: llama3.2
stream: false
```

AI responses are returned as a single JSON response. Server-side conversational history and streaming responses are not currently implemented.

---

# 🛡️ AI Response Validation

AI-generated meal replacements are validated before database updates.

The backend:

1. Generates a list of compatible recipes.
2. Sends only those candidates to the AI.
3. Requests a structured recipe selection.
4. Parses the AI response.
5. Validates the returned recipe ID/title against the candidate list.
6. Updates the meal plan only when a valid candidate is selected.

This creates a controlled AI workflow where the model assists with selection while the backend remains responsible for database integrity.

---

# 📦 Technology Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Cloudinary
* Multer
* multer-storage-cloudinary
* Ollama
* llama3.2

## Mobile

* Kotlin
* MVVM
* Retrofit
* OkHttp
* Kotlin Coroutines
* LiveData
* DataStore

## Web

* React
* JavaScript
* REST API integration

---

# 📁 Backend Structure

```text
src/
│
├── controllers/
│   ├── authController.js
│   ├── recipeController.js
│   ├── mealPlanController.js
│   ├── mealReplacementController.js
│   └── aiController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── recipeRoutes.js
│   ├── mealPlanRoutes.js
│   └── aiRoutes.js
│
├── models/
│   ├── User.js
│   ├── Recipe.js
│   └── MealPlan.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── uploadMiddleware.js
│
├── services/
│   ├── aiService.js
│   └── mealPlanService.js
│
├── config/
│   ├── db.js
│   └── cloudinary.js
│
├── utils/
│
├── app.js
└── server.js
```

---

# 🔗 API Endpoints

All endpoints are prefixed with:

```text
/api
```

Protected endpoints require:

```http
Authorization: Bearer <token>
```

---

## 🔐 Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

`/api/auth/me` requires authentication.

---

## 🍳 Recipes

```http
POST   /api/recipes
GET    /api/recipes
GET    /api/recipes/search
GET    /api/recipes/categories
GET    /api/recipes/recommended
GET    /api/recipes/week
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id
```

### Authorization

```text
POST   /api/recipes       → ADMIN
PUT    /api/recipes/:id   → Authenticated owner or ADMIN
DELETE /api/recipes/:id   → ADMIN
```

---

## ⭐ Ratings

```http
POST /api/recipes/:id/rate
```

Requires authentication.

---

## ❤️ Favorites

```http
POST   /api/recipes/favorites/:id
DELETE /api/recipes/favorites/:id
GET    /api/recipes/favorites
```

All require authentication.

---

## 📸 Image Upload

```http
POST /api/recipes/upload
```

Requires authentication.

Multipart field:

```text
image
```

Maximum file size:

```text
5 MB
```

---

## 📅 Meal Plans

```http
POST /api/meal-plans/generate
GET  /api/meal-plans
POST /api/meal-plans/:mealPlanId/replace
```

All require authentication.

---

## 🤖 AI Assistant

```http
POST /api/ai/chat
```

Requires authentication.

Example:

```json
{
  "message": "What can I replace my Monday breakfast with?"
}
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Cloudinary account
* Ollama for local AI functionality

---

## 1. Clone the Repository

```bash
git clone https://github.com/jeenwalvaishali/SmartMealPlanner-backend.git
```

Navigate to the project:

```bash
cd SmartMealPlanner-backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

Do not commit `.env` or production secrets to GitHub.

---

# 🤖 Ollama Setup

The AI functionality uses Ollama locally.

Install Ollama and make sure it is available on your machine.

Pull the model:

```bash
ollama pull llama3.2
```

Start the Ollama server:

```bash
ollama serve
```

If Ollama is already running as a background service, do not start a second server.

The backend communicates with:

```text
http://localhost:11434/api/generate
```

---

# ▶️ Start the Backend

### Development

```bash
npm run dev
```

This starts the server using Nodemon.

### Production-style start

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

unless a different `PORT` is configured.

---

# 📱 Android Local Development

When the Android application runs on an **Android Emulator**, the host computer's localhost is accessible through:

```text
http://10.0.2.2:5000/
```

For example:

```text
BASE_URL=http://10.0.2.2:5000/api/
```

For a physical Android device, use the computer's local IPv4 address:

```text
http://192.168.1.10:5000/
```

Both devices must be connected to the same local network.

---

# 🧪 API Testing

The API can be tested using tools such as:

* Postman
* Android application
* React web application

Example local API:

```text
http://localhost:5000/api
```

---

# 📈 Engineering & Performance Considerations

The backend includes several practices intended to improve reliability and performance:

* Input validation
* Pagination
* Pagination limits
* MongoDB indexes
* Lean queries for read-heavy operations
* JWT authentication
* Role-based authorization
* Ownership checks
* Protected routes
* Centralized error handling
* Cloudinary image lifecycle management
* Controlled AI context
* AI candidate validation

---

# 🔒 Security Considerations

Production deployments should use:

* HTTPS
* Secure environment variable management
* Strong JWT secrets
* Appropriate token expiration/refresh policies
* Restrictive CORS configuration
* Rate limiting
* Request validation
* Secure database credentials
* Monitoring and logging

The current development configuration allows CORS broadly for API requests, so production deployments should restrict allowed origins to the actual client applications.

---

# 🌐 Related Repositories

### 📱 Android Application

https://github.com/jeenwalvaishali/SMP-FrontendAndroidAPP

### 🌐 React Web Application

https://github.com/jeenwalvaishali/SmartMealPlanner-backend

### 🛠️ Admin Panel

https://github.com/jeenwalvaishali/SMP-Admin-Panel


---

# 👩‍💻 Author

**Vaishali Jeenwal**

Software Engineer

**Technologies:** Kotlin • Android • React • JavaScript • Node.js • Express • MongoDB • REST APIs • AI Integration

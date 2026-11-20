# RecipeHub – Recipe Sharing and Meal Planner

RecipeHub is a full-stack web application where users share recipes, save favourites and plan their weekly meals. It was built as a college assignment with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Accounts:** register, log in, log out. Passwords are hashed with bcrypt and sessions use JWT. Protected pages redirect to login.
- **Profile:** shows your name, email and the recipes you have submitted (with Edit and Delete buttons).
- **Recipes (CRUD):** create, view, edit and delete recipes. Each recipe has a name, description, ingredients, steps, category, prep time, cooking time, servings and an image URL. You can only edit your own recipes.
- **Search, filter and pagination:** search by recipe name, search by ingredient, filter by category. Pagination is done on the backend (8 recipes per page).
- **Ratings and comments:** 1 to 5 star ratings (one rating per user per recipe, which can be changed later). The average rating is calculated with a MongoDB aggregation. Comments show the username.
- **Favourites:** save and remove recipes, with a dedicated Favourites page.
- **Weekly meal planner:** assign a recipe to any day and meal (Breakfast, Lunch, Dinner), change it or remove it.
- **Admin moderation:** users can report a recipe with a reason. Admins see all reported recipes in the Admin Panel and can dismiss the reports or remove the recipe.

## Technologies

| Part | Technology |
| --- | --- |
| Backend | Node.js, Express.js, MongoDB, Mongoose, dotenv, bcrypt, jsonwebtoken (plus `cors`) |
| Frontend | React (built with Vite), React Router DOM, Fetch API, Context API |

## Project structure

```
recipehub/
├── backend/
│   ├── config/          db.js (MongoDB connection), constants.js (categories, days, meal types)
│   ├── controllers/     the logic for each route (auth, recipes, favourites, meal plan, admin, user)
│   ├── middleware/      auth.js (protect, optionalAuth, adminOnly), errorHandler.js
│   ├── models/          User, Recipe, Comment, MealPlan
│   ├── routes/          URL definitions that connect to the controllers
│   ├── utils/           helpers.js, recipeStages.js (the aggregation pipeline)
│   ├── seed.js          sample data script
│   ├── server.js        starts the Express app
│   └── .env.example
└── frontend/
    ├── index.html
    └── src/
        ├── components/  Navbar, RecipeCard, RecipeForm, Pagination, ProtectedRoute, ...
        ├── context/     AuthContext.jsx (login state)
        ├── hooks/       useAuth.js, useFetch.js
        ├── pages/       Home, Login, Register, RecipeDetails, AddRecipe, EditRecipe,
        │                Profile, Favourites, MealPlanner, AdminPanel
        ├── services/    api.js (the Fetch API helper)
        ├── App.jsx      routes
        ├── main.jsx
        └── styles.css
```

## Installation

You need **Node.js 18 or newer** and **MongoDB**.

### 1. MongoDB setup

Choose one:

- **Local MongoDB:** install MongoDB Community Edition from mongodb.com, then make sure it is running (on Windows it runs as a service after installation). The default address is `mongodb://127.0.0.1:27017`.
- **MongoDB Atlas (cloud):** create a free cluster, create a database user, allow your IP address, and copy the connection string (it looks like `mongodb+srv://user:password@cluster.mongodb.net/recipehub`).

### 2. Backend setup

```bash
cd backend
npm install
```

Create the environment file by copying the example:

```bash
# Windows (Command Prompt)
copy .env.example .env
# macOS / Linux / Git Bash
cp .env.example .env
```

Open `.env` and set your values.

### Environment variables (`backend/.env`)

| Variable | Meaning |
| --- | --- |
| `PORT` | Port for the API. Default `5000`. |
| `MONGO_URI` | MongoDB connection string. Local: `mongodb://127.0.0.1:27017/recipehub` |
| `JWT_SECRET` | A long random string used to sign login tokens. Choose your own and keep it private. |
| `CLIENT_URL` | Address of the frontend, used for CORS. Default `http://localhost:5173`. |

The `.env` file is ignored by git so your secrets are not uploaded.

### 3. Seed data

From the `backend` folder:

```bash
npm run seed
```

This adds 10 sample recipes and two accounts. The sample recipes are marked as sample content (they show a note on the recipe page and belong to the author "RecipeHub Sample Kitchen"). There are no fake ratings, comments or users. Running the seed again replaces only the sample recipes. Your own recipes are not touched.

| Account | Email | Password |
| --- | --- | --- |
| Admin | `admin@recipehub.com` | `Admin@123` |
| Demo user | `demo@recipehub.com` | `Demo@123` |

These are for local demonstration only. Do not use them on a public site.

Some sample recipes use photo links from Unsplash. If an image cannot load (no internet, or the link changes), the card shows a plain placeholder with the category. You can change any image URL by editing the recipe, or in `seed.js`.

### 4. Frontend setup

```bash
cd frontend
npm install
```

No `.env` file is needed. During development, Vite forwards `/api` requests to `http://localhost:5000`.

## How to run

Open two terminals.

**Terminal 1 (backend):**

```bash
cd backend
npm run dev      # restarts on changes. Use "npm start" for a normal run.
```

You should see `Server running on http://localhost:5000` and `MongoDB connected`.

**Terminal 2 (frontend):**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## API overview

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Create account |
| POST | `/api/auth/login` | public | Log in, returns JWT |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/users/profile` | user | Profile and my recipes |
| GET | `/api/recipes` | public | List with `search`, `ingredient`, `category`, `page`, `limit` |
| GET | `/api/recipes/options` | public | Recipe ids and titles (meal planner dropdowns) |
| GET | `/api/recipes/:id` | public | One recipe (includes your rating if logged in) |
| POST | `/api/recipes` | user | Create |
| PUT | `/api/recipes/:id` | author | Edit |
| DELETE | `/api/recipes/:id` | author or admin | Delete |
| POST | `/api/recipes/:id/rate` | user | Add or update rating (1 to 5) |
| GET / POST | `/api/recipes/:id/comments` | public / user | List / add comments |
| DELETE | `/api/recipes/:id/comments/:commentId` | author or admin | Delete a comment |
| POST | `/api/recipes/:id/report` | user | Report a recipe |
| GET | `/api/favourites` | user | My favourites |
| POST / DELETE | `/api/favourites/:recipeId` | user | Add / remove favourite |
| GET / PUT | `/api/mealplan` | user | View / set a meal |
| DELETE | `/api/mealplan/:day/:mealType` | user | Remove a meal |
| GET | `/api/admin/reports` | admin | Reported recipes |
| DELETE | `/api/admin/reports/:recipeId` | admin | Dismiss reports |
| DELETE | `/api/admin/recipes/:recipeId` | admin | Remove a recipe |

## Notes for the viva

- **Password security:** `authController.js` hashes passwords with `bcrypt.hash` before saving, and checks them with `bcrypt.compare` at login. The `password` field has `select: false` so it is never returned by queries.
- **JWT flow:** login returns a token. The frontend saves it in `localStorage`, and `services/api.js` sends it in the `Authorization: Bearer` header. `middleware/auth.js` verifies it and sets `req.user`.
- **Roles:** `adminOnly` middleware checks `req.user.role`. New accounts are always `user`. Only the seed script creates an admin. The frontend also hides admin links, but the real protection is on the backend.
- **Aggregation:** `utils/recipeStages.js` uses `$addFields` with `$avg` and `$size` to calculate average rating and rating count, and `$lookup` to attach the author name.
- **One rating per user:** ratings are stored inside the recipe. `rateRecipe` looks for an existing rating by that user and updates it instead of adding another.
- **Pagination:** `getRecipes` uses `countDocuments` for the total and `$skip` / `$limit` in the aggregation for the current page.
- **Context API:** `AuthContext.jsx` holds the logged-in user and the `login`, `register` and `logout` functions. `useAuth` is a small hook to read it.
- **Deleting a recipe** also removes its comments, favourites and meal plan entries (`removeRecipeEverywhere` in `recipeController.js`).

## Troubleshooting

- **"MongoDB connection failed":** MongoDB is not running, or `MONGO_URI` is wrong.
- **"Missing MONGO_URI or JWT_SECRET":** you have not created `backend/.env` yet.
- **Frontend shows "Cannot reach the server":** start the backend first and check it is on port 5000.
- **Port already in use:** change `PORT` in `.env` and update the proxy target in `frontend/vite.config.js`.

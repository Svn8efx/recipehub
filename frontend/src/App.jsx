import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecipeDetails from "./pages/RecipeDetails";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import Profile from "./pages/Profile";
import Favourites from "./pages/Favourites";
import MealPlanner from "./pages/MealPlanner";
import AdminPanel from "./pages/AdminPanel";

function NotFound() {
  return (
    <div className="container page">
      <h1>Page not found</h1>
      <p><Link to="/">Back to recipes</Link></p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes/new" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />
          <Route path="/recipes/:id/edit" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
          <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

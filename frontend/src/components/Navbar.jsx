import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          RecipeHub
        </Link>
        <button className="btn btn-small menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
          Menu
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={close}>Explore</NavLink>
          {user ? (
            <>
              <NavLink to="/recipes/new" onClick={close}>Add Recipe</NavLink>
              <NavLink to="/favourites" onClick={close}>Favourites</NavLink>
              <NavLink to="/meal-planner" onClick={close}>Meal Planner</NavLink>
              <NavLink to="/profile" onClick={close}>Profile</NavLink>
              {user.role === "admin" && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
              <button className="btn btn-small" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-small" onClick={close}>Log in</Link>
              <Link to="/register" className="btn btn-small btn-primary" onClick={close}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

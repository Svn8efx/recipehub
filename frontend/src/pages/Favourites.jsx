import { useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { api } from "../services/api";
import RecipeCard from "../components/RecipeCard";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function Favourites() {
  const { user, setUser } = useAuth();
  const { data, setData, loading, error } = useFetch("/favourites");
  const [notice, setNotice] = useState("");

  const removeFavourite = async (recipe) => {
    setNotice("");
    try {
      const result = await api(`/favourites/${recipe._id}`, { method: "DELETE" });
      setUser({ ...user, favourites: result.favourites });
      setData({ recipes: data.recipes.filter((r) => r._id !== recipe._id) });
    } catch (err) {
      setNotice(err.message);
    }
  };

  if (loading && !data) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><Message>{error}</Message></div>;

  return (
    <div className="container page">
      <h1>My favourites</h1>
      <Message>{notice}</Message>
      {data.recipes.length === 0 ? (
        <div className="empty">
          <p>You have not saved any recipes yet.</p>
          <Link className="btn btn-primary" to="/">Browse recipes</Link>
        </div>
      ) : (
        <div className="grid">
          {data.recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe}>
              <button className="btn btn-small" onClick={() => removeFavourite(recipe)}>Remove</button>
            </RecipeCard>
          ))}
        </div>
      )}
    </div>
  );
}

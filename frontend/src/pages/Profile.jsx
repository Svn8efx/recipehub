import { useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { api } from "../services/api";
import RecipeCard from "../components/RecipeCard";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function Profile() {
  const { data, setData, loading, error } = useFetch("/users/profile");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const deleteRecipe = async (recipe) => {
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    try {
      await api(`/recipes/${recipe._id}`, { method: "DELETE" });
      setData({ ...data, recipes: data.recipes.filter((r) => r._id !== recipe._id) });
      setNotice({ type: "success", text: "Recipe deleted." });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  if (loading && !data) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><Message>{error}</Message></div>;

  return (
    <div className="container page">
      <h1>My profile</h1>
      <dl className="profile-info">
        <div><dt>Name</dt><dd>{data.user.name}</dd></div>
        <div><dt>Email</dt><dd>{data.user.email}</dd></div>
      </dl>

      <h2>My recipes</h2>
      <Message type={notice.type}>{notice.text}</Message>

      {data.recipes.length === 0 ? (
        <div className="empty">
          <p>You have not added any recipes yet.</p>
          <Link className="btn btn-primary" to="/recipes/new">Add your first recipe</Link>
        </div>
      ) : (
        <div className="grid">
          {data.recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe}>
              <Link className="btn btn-small" to={`/recipes/${recipe._id}/edit`}>Edit</Link>
              <button className="btn btn-small btn-danger" onClick={() => deleteRecipe(recipe)}>Delete</button>
            </RecipeCard>
          ))}
        </div>
      )}
    </div>
  );
}

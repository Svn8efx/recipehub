import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { api } from "../services/api";
import RecipeForm from "../components/RecipeForm";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function EditRecipe() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`/recipes/${id}`);

  if (loading && !data) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><Message>{error}</Message></div>;

  const recipe = data.recipe;
  if (recipe.author._id !== user._id) {
    return <div className="container page"><Message>You can only edit your own recipes.</Message></div>;
  }

  const saveRecipe = async (changes) => {
    await api(`/recipes/${id}`, { method: "PUT", body: changes });
    navigate(`/recipes/${id}`);
  };

  // The form wants ingredients and steps as text, one item per line
  const initial = {
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients.join("\n"),
    steps: recipe.steps.join("\n"),
    category: recipe.category,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    imageUrl: recipe.imageUrl,
  };

  return (
    <div className="container narrow page">
      <h1>Edit recipe</h1>
      <RecipeForm initial={initial} submitLabel="Save changes" onSubmit={saveRecipe} />
    </div>
  );
}

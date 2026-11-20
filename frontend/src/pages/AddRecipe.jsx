import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import RecipeForm from "../components/RecipeForm";

export default function AddRecipe() {
  const navigate = useNavigate();

  const createRecipe = async (recipe) => {
    const data = await api("/recipes", { method: "POST", body: recipe });
    navigate(`/recipes/${data.recipe._id}`);
  };

  return (
    <div className="container narrow page">
      <h1>Add a recipe</h1>
      <RecipeForm submitLabel="Publish recipe" onSubmit={createRecipe} />
    </div>
  );
}

import { Link } from "react-router-dom";
import RecipeImage from "./RecipeImage";

// `children` is optional and shows under the card (e.g. Edit / Delete buttons)
export default function RecipeCard({ recipe, children }) {
  return (
    <article className="card">
      <Link to={`/recipes/${recipe._id}`} className="card-link">
        <div className="card-image">
          <RecipeImage src={recipe.imageUrl} category={recipe.category} />
        </div>
        <div className="card-body">
          <h3>{recipe.title}</h3>
          <p className="card-category">{recipe.category}</p>
          <p className="card-meta">Cooking time: {recipe.cookTime} min</p>
          <p className="card-meta">
            {recipe.ratingCount > 0
              ? `Rating: ${recipe.averageRating.toFixed(1)} / 5 (${recipe.ratingCount})`
              : "No ratings yet"}
          </p>
          <p className="card-meta">By {recipe.author.name}</p>
        </div>
      </Link>
      {children && <div className="card-actions">{children}</div>}
    </article>
  );
}

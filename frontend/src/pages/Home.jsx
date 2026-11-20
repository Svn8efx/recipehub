import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { CATEGORIES } from "../services/api";
import RecipeCard from "../components/RecipeCard";
import Pagination from "../components/Pagination";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function Home() {
  // Search, category and page live in the URL (?search=...&page=2) so the back button works
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const ingredient = params.get("ingredient") || "";
  const category = params.get("category") || "";
  const page = Number(params.get("page")) || 1;

  const [searchText, setSearchText] = useState(search);
  const [ingredientText, setIngredientText] = useState(ingredient);

  const query = new URLSearchParams({ page, limit: 8 });
  if (search) query.set("search", search);
  if (ingredient) query.set("ingredient", ingredient);
  if (category) query.set("category", category);
  const { data, loading, error } = useFetch(`/recipes?${query}`);

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchText.trim(), ingredient: ingredientText.trim(), page: "" });
  };

  const clearFilters = () => {
    setSearchText("");
    setIngredientText("");
    setParams({});
  };

  const changePage = (newPage) => {
    updateParams({ page: newPage === 1 ? "" : String(newPage) });
    window.scrollTo(0, 0);
  };

  const hasFilters = search || ingredient || category;

  return (
    <div className="container page">
      <h1>Explore recipes</h1>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search by recipe name"
          aria-label="Search by recipe name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <input
          type="search"
          placeholder="Search by ingredient"
          aria-label="Search by ingredient"
          value={ingredientText}
          onChange={(e) => setIngredientText(e.target.value)}
        />
        <button className="btn btn-primary">Search</button>
      </form>

      <div className="chips">
        <button className={`chip ${!category ? "active" : ""}`} onClick={() => updateParams({ category: "", page: "" })}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => updateParams({ category: c, page: "" })}>
            {c}
          </button>
        ))}
      </div>

      <Message>{error}</Message>
      {loading && !data && <Loader text="Loading recipes..." />}

      {data && (
        <>
          <p className="result-count">
            {data.total} {data.total === 1 ? "recipe" : "recipes"}
            {hasFilters && (
              <>
                {" "}
                <button className="link-button" onClick={clearFilters}>Clear filters</button>
              </>
            )}
          </p>

          {data.recipes.length === 0 ? (
            <div className="empty">
              <p>No recipes found. Try a different search or category.</p>
            </div>
          ) : (
            <div className={`grid ${loading ? "dimmed" : ""}`}>
              {data.recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}

          <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
        </>
      )}
    </div>
  );
}

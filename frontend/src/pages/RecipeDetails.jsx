import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { api, DAYS, MEAL_TYPES } from "../services/api";
import RecipeImage from "../components/RecipeImage";
import Stars from "../components/Stars";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function RecipeDetails() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const { data, setData, loading, error } = useFetch(`/recipes/${id}`);
  const comments = useFetch(`/recipes/${id}/comments`);

  const [notice, setNotice] = useState({ type: "", text: "" });
  const [commentText, setCommentText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [plan, setPlan] = useState({ day: DAYS[0], mealType: MEAL_TYPES[0] });

  if (loading && !data) return <div className="container page"><Loader text="Loading recipe..." /></div>;
  if (error) {
    return (
      <div className="container page">
        <Message>{error}</Message>
        <p><Link to="/">Back to recipes</Link></p>
      </div>
    );
  }

  const recipe = data.recipe;
  const isAuthor = user && user._id === recipe.author._id;
  const isAdmin = user && user.role === "admin";
  const isFavourite = user && user.favourites.includes(recipe._id);

  // Runs an action and shows a success or error message
  const run = async (action, successText) => {
    setNotice({ type: "", text: "" });
    try {
      await action();
      if (successText) setNotice({ type: "success", text: successText });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const toggleFavourite = () =>
    run(async () => {
      const result = await api(`/favourites/${id}`, { method: isFavourite ? "DELETE" : "POST" });
      setUser({ ...user, favourites: result.favourites });
    }, isFavourite ? "Removed from favourites." : "Saved to favourites.");

  const rate = (value) =>
    run(async () => {
      const result = await api(`/recipes/${id}/rate`, { method: "POST", body: { value } });
      setData({ recipe: { ...recipe, ...result } });
    }, "Your rating was saved.");

  const deleteRecipe = async () => {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) return;
    run(async () => {
      await api(`/recipes/${id}`, { method: "DELETE" });
      navigate("/");
    });
  };

  const addToPlan = () =>
    run(
      () => api("/mealplan", { method: "PUT", body: { day: plan.day, mealType: plan.mealType, recipeId: id } }),
      `Added to ${plan.day} ${plan.mealType.toLowerCase()}.`
    );

  const submitReport = (e) => {
    e.preventDefault();
    run(async () => {
      await api(`/recipes/${id}/report`, { method: "POST", body: { reason: reportReason } });
      setShowReport(false);
      setReportReason("");
    }, "Report sent. An admin will review this recipe.");
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return setNotice({ type: "error", text: "Write a comment first." });
    run(async () => {
      await api(`/recipes/${id}/comments`, { method: "POST", body: { text: commentText } });
      setCommentText("");
      comments.reload();
    });
  };

  const deleteComment = (commentId) =>
    run(async () => {
      await api(`/recipes/${id}/comments/${commentId}`, { method: "DELETE" });
      comments.reload();
    });

  return (
    <div className="container page">
      <p><Link to="/">&larr; All recipes</Link></p>

      <div className="details-header">
        <div className="details-image">
          <RecipeImage src={recipe.imageUrl} category={recipe.category} />
        </div>
        <div>
          <h1>{recipe.title}</h1>
          <p className="card-category">{recipe.category}</p>
          <p>By {recipe.author.name}</p>
          <p>
            {recipe.ratingCount > 0 ? (
              <>
                <Stars value={recipe.averageRating} /> {recipe.averageRating.toFixed(1)} from {recipe.ratingCount}{" "}
                {recipe.ratingCount === 1 ? "rating" : "ratings"}
              </>
            ) : (
              "No ratings yet"
            )}
          </p>
          {recipe.isSample && <p className="sample-note">Sample recipe added with the demo data.</p>}
          <p>{recipe.description}</p>

          <dl className="facts">
            <div><dt>Prep time</dt><dd>{recipe.prepTime} min</dd></div>
            <div><dt>Cooking time</dt><dd>{recipe.cookTime} min</dd></div>
            <div><dt>Servings</dt><dd>{recipe.servings}</dd></div>
          </dl>

          <div className="button-row">
            {user && (
              <button className="btn" onClick={toggleFavourite}>
                {isFavourite ? "Remove from favourites" : "Save to favourites"}
              </button>
            )}
            {isAuthor && <Link className="btn" to={`/recipes/${id}/edit`}>Edit</Link>}
            {(isAuthor || isAdmin) && <button className="btn btn-danger" onClick={deleteRecipe}>Delete</button>}
            {user && !isAuthor && <button className="btn" onClick={() => setShowReport(!showReport)}>Report</button>}
          </div>
        </div>
      </div>

      <Message type={notice.type}>{notice.text}</Message>

      {showReport && (
        <form className="form box" onSubmit={submitReport}>
          <label>
            Why are you reporting this recipe?
            <textarea rows={3} maxLength={300} value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
          </label>
          <button className="btn btn-danger">Send report</button>
        </form>
      )}

      <div className="two-columns">
        <section>
          <h2>Ingredients</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
        <section>
          <h2>Method</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </section>
      </div>

      {user && (
        <section className="box">
          <h2>Plan this recipe</h2>
          <div className="inline-form">
            <select aria-label="Day" value={plan.day} onChange={(e) => setPlan({ ...plan, day: e.target.value })}>
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select aria-label="Meal" value={plan.mealType} onChange={(e) => setPlan({ ...plan, mealType: e.target.value })}>
              {MEAL_TYPES.map((m) => <option key={m}>{m}</option>)}
            </select>
            <button className="btn" onClick={addToPlan}>Add to meal planner</button>
            <Link to="/meal-planner">View planner</Link>
          </div>
        </section>
      )}

      <section>
        <h2>Rating</h2>
        {user ? (
          <div className="rate">
            <p>{recipe.myRating ? `Your rating: ${recipe.myRating} out of 5. Choose a star to change it.` : "Rate this recipe:"}</p>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={n <= recipe.myRating ? "on" : ""} onClick={() => rate(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
                  {n <= recipe.myRating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p><Link to="/login" state={{ from: `/recipes/${id}` }}>Log in</Link> to rate, comment and save recipes.</p>
        )}
      </section>

      <section>
        <h2>Comments</h2>
        {user && (
          <form className="form" onSubmit={submitComment}>
            <label>
              Add a comment
              <textarea rows={3} maxLength={500} value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            </label>
            <button className="btn btn-primary">Post comment</button>
          </form>
        )}
        <Message>{comments.error}</Message>
        {comments.loading && !comments.data && <Loader text="Loading comments..." />}
        {comments.data && comments.data.comments.length === 0 && <p className="empty-text">No comments yet.</p>}
        {comments.data && (
          <ul className="comments">
            {comments.data.comments.map((c) => (
              <li key={c._id}>
                <p className="comment-head">
                  <strong>{c.user ? c.user.name : "Deleted user"}</strong>{" "}
                  <span className="muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                </p>
                <p>{c.text}</p>
                {user && (c.user?._id === user._id || isAdmin) && (
                  <button className="link-button" onClick={() => deleteComment(c._id)}>Delete</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

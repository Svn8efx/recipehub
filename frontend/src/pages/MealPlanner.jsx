import { useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { api, DAYS, MEAL_TYPES } from "../services/api";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function MealPlanner() {
  const plan = useFetch("/mealplan");
  const options = useFetch("/recipes/options");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  if ((plan.loading && !plan.data) || (options.loading && !options.data)) {
    return <div className="container page"><Loader text="Loading your meal plan..." /></div>;
  }
  if (plan.error || options.error) {
    return <div className="container page"><Message>{plan.error || options.error}</Message></div>;
  }

  const findEntry = (day, mealType) => plan.data.entries.find((e) => e.day === day && e.mealType === mealType);

  // Choosing a recipe sets (or changes) the meal. Choosing "Not planned" removes it.
  const changeMeal = async (day, mealType, recipeId) => {
    setNotice("");
    setBusy(`${day}-${mealType}`);
    try {
      const result = recipeId
        ? await api("/mealplan", { method: "PUT", body: { day, mealType, recipeId } })
        : await api(`/mealplan/${day}/${mealType}`, { method: "DELETE" });
      plan.setData(result);
    } catch (err) {
      setNotice(err.message);
    }
    setBusy("");
  };

  return (
    <div className="container page">
      <h1>Weekly meal planner</h1>
      <Message>{notice}</Message>

      {options.data.recipes.length === 0 ? (
        <div className="empty">
          <p>There are no recipes to plan with yet.</p>
          <Link className="btn btn-primary" to="/recipes/new">Add a recipe</Link>
        </div>
      ) : (
        <table className="planner">
          <thead>
            <tr>
              <th>Day</th>
              {MEAL_TYPES.map((m) => <th key={m}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <th scope="row">{day}</th>
                {MEAL_TYPES.map((mealType) => {
                  const entry = findEntry(day, mealType);
                  return (
                    <td key={mealType} data-label={mealType}>
                      <select
                        aria-label={`${day} ${mealType}`}
                        value={entry ? entry.recipe._id : ""}
                        disabled={busy === `${day}-${mealType}`}
                        onChange={(e) => changeMeal(day, mealType, e.target.value)}
                      >
                        <option value="">Not planned</option>
                        {options.data.recipes.map((r) => (
                          <option key={r._id} value={r._id}>{r.title}</option>
                        ))}
                      </select>
                      {entry && (
                        <div className="planner-actions">
                          <Link to={`/recipes/${entry.recipe._id}`}>View</Link>
                          <button className="link-button" onClick={() => changeMeal(day, mealType, "")}>Remove</button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

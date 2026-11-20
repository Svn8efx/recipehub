import { useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { api } from "../services/api";
import Message from "../components/Message";
import Loader from "../components/Loader";

export default function AdminPanel() {
  const { data, setData, loading, error } = useFetch("/admin/reports");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const takeAction = async (recipe, path, successText) => {
    setNotice({ type: "", text: "" });
    try {
      await api(path, { method: "DELETE" });
      setData({ recipes: data.recipes.filter((r) => r._id !== recipe._id) });
      setNotice({ type: "success", text: successText });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const dismiss = (recipe) => takeAction(recipe, `/admin/reports/${recipe._id}`, `Reports dismissed for "${recipe.title}".`);

  const remove = (recipe) => {
    if (!window.confirm(`Remove "${recipe.title}" permanently?`)) return;
    takeAction(recipe, `/admin/recipes/${recipe._id}`, `"${recipe.title}" was removed.`);
  };

  if (loading && !data) return <div className="container page"><Loader /></div>;
  if (error) return <div className="container page"><Message>{error}</Message></div>;

  return (
    <div className="container page">
      <h1>Admin panel</h1>
      <h2>Reported recipes</h2>
      <Message type={notice.type}>{notice.text}</Message>

      {data.recipes.length === 0 ? (
        <div className="empty"><p>No recipes have been reported.</p></div>
      ) : (
        <ul className="reports">
          {data.recipes.map((recipe) => (
            <li key={recipe._id} className="box">
              <h3><Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link></h3>
              <p className="muted">
                {recipe.category}, by {recipe.author ? recipe.author.name : "unknown"}.{" "}
                {recipe.reports.length} {recipe.reports.length === 1 ? "report" : "reports"}.
              </p>
              <ul className="report-list">
                {recipe.reports.map((report) => (
                  <li key={report._id}>
                    <strong>{report.user ? report.user.name : "Deleted user"}:</strong> {report.reason}
                  </li>
                ))}
              </ul>
              <div className="button-row">
                <button className="btn" onClick={() => dismiss(recipe)}>Dismiss reports</button>
                <button className="btn btn-danger" onClick={() => remove(recipe)}>Remove recipe</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

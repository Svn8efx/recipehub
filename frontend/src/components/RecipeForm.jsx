import { useState } from "react";
import { CATEGORIES } from "../services/api";
import Message from "./Message";

// Used by both the Add Recipe and Edit Recipe pages.
// Ingredients and steps are typed one per line and sent to the API as arrays.
export default function RecipeForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    category: CATEGORIES[0],
    prepTime: "",
    cookTime: "",
    servings: "",
    imageUrl: "",
    ...initial,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toLines = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ingredients = toLines(form.ingredients);
    const steps = toLines(form.steps);

    if (!form.title.trim()) return setError("Recipe name is required");
    if (!form.description.trim()) return setError("Description is required");
    if (ingredients.length === 0) return setError("Add at least one ingredient");
    if (steps.length === 0) return setError("Add at least one cooking step");
    if (form.prepTime === "" || Number(form.prepTime) < 0) return setError("Enter the preparation time in minutes");
    if (form.cookTime === "" || Number(form.cookTime) < 0) return setError("Enter the cooking time in minutes");
    if (!form.servings || Number(form.servings) < 1) return setError("Servings must be at least 1");
    if (form.imageUrl.trim() && !/^https?:\/\/\S+$/i.test(form.imageUrl.trim())) {
      return setError("Image URL must start with http:// or https://");
    }

    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        ingredients,
        steps,
        category: form.category,
        prepTime: Number(form.prepTime),
        cookTime: Number(form.cookTime),
        servings: Number(form.servings),
        imageUrl: form.imageUrl.trim(),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Message>{error}</Message>

      <label>
        Recipe name
        <input name="title" value={form.title} onChange={handleChange} maxLength={100} />
      </label>

      <label>
        Description
        <textarea name="description" rows={3} value={form.description} onChange={handleChange} maxLength={1000} />
      </label>

      <label>
        Ingredients
        <textarea name="ingredients" rows={6} value={form.ingredients} onChange={handleChange} />
        <span className="hint">One ingredient per line.</span>
      </label>

      <label>
        Cooking steps
        <textarea name="steps" rows={6} value={form.steps} onChange={handleChange} />
        <span className="hint">One step per line.</span>
      </label>

      <div className="form-row">
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Prep time (min)
          <input name="prepTime" type="number" min="0" value={form.prepTime} onChange={handleChange} />
        </label>
        <label>
          Cook time (min)
          <input name="cookTime" type="number" min="0" value={form.cookTime} onChange={handleChange} />
        </label>
        <label>
          Servings
          <input name="servings" type="number" min="1" value={form.servings} onChange={handleChange} />
        </label>
      </div>

      <label>
        Image URL
        <input name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
        <span className="hint">Optional. Link to a photo of the dish.</span>
      </label>

      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

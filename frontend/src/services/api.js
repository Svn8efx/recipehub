const API_URL = import.meta.env.VITE_API_URL || "/api";

export const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Soup", "Salad", "Dessert"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"];

// One helper for every request. It adds the JWT token, sends JSON and
// throws an Error with the backend's message when something goes wrong.
export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

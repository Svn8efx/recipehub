import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Message from "../components/Message";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Name must be at least 2 characters");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email address");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container narrow page">
      <h1>Create an account</h1>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Message>{error}</Message>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
          <span className="hint">At least 6 characters.</span>
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} autoComplete="new-password" />
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Coffee } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      login(res);
      const next = params.get("next");
      navigate(res.user.role === "admin" ? "/admin" : next || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80"
          alt="Cafe interior"
        />
        <div className="auth-visual-content">
          <Coffee size={28} style={{ marginBottom: 12 }} />
          <h2>Welcome back to Ember &amp; Oak</h2>
          <p>Log in to track your orders and reorder your favorites in seconds.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Log in</h2>
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="float-field">
              <input id="email" type="email" placeholder=" " required value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="email">Email</label>
            </div>
            <div className="float-field">
              <input
                id="password"
                type="password"
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary btn-block btn-shine" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
          <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
          <p style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Admin demo login: see backend/.env.example for the seeded admin credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

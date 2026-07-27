import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Coffee } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordTooShort = touched && password.length > 0 && password.length < 6;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (password.length < 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.register({ name, email, password });
      login(res);
      navigate("/");
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
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80"
          alt="Coffee and pastries"
        />
        <div className="auth-visual-content">
          <Coffee size={28} style={{ marginBottom: 12 }} />
          <h2>Join Ember &amp; Oak</h2>
          <p>Create an account to order, track deliveries, and save your favorites.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Create your account</h2>
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="float-field">
              <input id="name" placeholder=" " required value={name} onChange={(e) => setName(e.target.value)} />
              <label htmlFor="name">Full name</label>
            </div>
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
                onBlur={() => setTouched(true)}
              />
              <label htmlFor="password">Password</label>
            </div>
            {passwordTooShort && (
              <div className="field-error">
                <AlertCircle size={13} /> Password must be at least 6 characters
              </div>
            )}
            <button className="btn btn-primary btn-block btn-shine" disabled={loading} style={{ marginTop: 12 }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

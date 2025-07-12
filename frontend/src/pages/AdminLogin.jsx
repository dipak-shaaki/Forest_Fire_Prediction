import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      // build form‑urlencoded body
      const formData = new URLSearchParams();
      formData.append("username", email);   // <-- key MUST be 'username'
      formData.append("password", password);

      const { data } = await axios.post(
        "http://localhost:8000/admin/login",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      localStorage.setItem("adminToken", data.access_token);
      navigate("/admin-dashboard");
    } catch (error) {
      setErr("Login failed. Check credentials.");
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Login
        </button>
        {err && <p style={{ color: "red", marginTop: 10 }}>{err}</p>}
      </form>
    </div>
  );
}

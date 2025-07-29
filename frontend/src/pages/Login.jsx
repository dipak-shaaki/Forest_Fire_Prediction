import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        nid: "",
        password: "",
        identifier: "",
    });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/register", {
                email: formData.email,
                username: formData.username,
                nid: formData.nid,
                password: formData.password,
            });

            setMessage(data.message);
            // Store email for OTP verification
            localStorage.setItem("pendingVerificationEmail", formData.email);

            // Redirect to OTP verification page
            setTimeout(() => {
                navigate("/verify-otp");
            }, 2000);

        } catch (err) {
            console.error("Signup error:", err);
            let errorMessage = "Registration failed. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/login", {
                identifier: formData.identifier,
                password: formData.password,
            });

            setMessage("Login successful!");

            // Use the login function from auth context
            login(data.access_token, data.role);

            // Redirect based on role
            setTimeout(() => {
                if (data.role === "admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            }, 1000);

        } catch (err) {
            console.error("Login error:", err);
            let errorMessage = "Login failed. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>
                {isSignup ? "Sign Up" : "Login"}
            </h2>

            <form onSubmit={isSignup ? handleSignup : handleLogin}>
                {isSignup ? (
                    <>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                                Email:
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                style={{
                                    width: "100%",
                                    padding: 12,
                                    border: "2px solid #ddd",
                                    borderRadius: 4,
                                    outline: "none"
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                                Username:
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                required
                                style={{
                                    width: "100%",
                                    padding: 12,
                                    border: "2px solid #ddd",
                                    borderRadius: 4,
                                    outline: "none"
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                                NID:
                            </label>
                            <input
                                type="text"
                                name="nid"
                                value={formData.nid}
                                onChange={handleChange}
                                placeholder="Enter NID"
                                required
                                style={{
                                    width: "100%",
                                    padding: 12,
                                    border: "2px solid #ddd",
                                    borderRadius: 4,
                                    outline: "none"
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                            Email or Username:
                        </label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder="Enter email or username"
                            required
                            style={{
                                width: "100%",
                                padding: 12,
                                border: "2px solid #ddd",
                                borderRadius: 4,
                                outline: "none"
                            }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                        Password:
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                        style={{
                            width: "100%",
                            padding: 12,
                            border: "2px solid #ddd",
                            borderRadius: 4,
                            outline: "none"
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: 12,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 16,
                        cursor: "pointer",
                        marginBottom: 16
                    }}
                >
                    {isSignup ? "Sign Up" : "Login"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                    onClick={() => {
                        setIsSignup((s) => !s);
                        setError("");
                        setMessage("");
                    }}
                    style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer" }}
                >
                    {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </button>
                {!isSignup && (
                    <div style={{ marginTop: 10 }}>
                        <button
                            onClick={() => navigate("/forgot-password")}
                            style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}
            </div>
            {message && <div style={{ color: "green", marginTop: 10 }}>{message}</div>}
            {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        </div>
    );
} 
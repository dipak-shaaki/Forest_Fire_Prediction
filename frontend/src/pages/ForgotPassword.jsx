import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/forgot-password", {
                email: email
            });

            setMessage(data.message);
            // Store email for password reset OTP page
            localStorage.setItem("resetPasswordEmail", email);

            // Redirect to password reset OTP page after 2 seconds
            setTimeout(() => {
                navigate(`/reset-password?email=${email}`);
            }, 2000);

        } catch (err) {
            console.error("Forgot password error:", err);
            let errorMessage = "Failed to send password reset OTP. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>Forgot Password</h2>

            <p style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>
                Enter your email address and we'll send you a password reset OTP.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                        Email Address:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                <button
                    type="submit"
                    disabled={loading || !email}
                    style={{
                        width: "100%",
                        padding: 12,
                        background: loading || !email ? "#ccc" : "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 16,
                        cursor: loading || !email ? "not-allowed" : "pointer",
                        marginBottom: 16
                    }}
                >
                    {loading ? "Sending..." : "Send Reset OTP"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        cursor: "pointer",
                        textDecoration: "underline"
                    }}
                >
                    Back to Login
                </button>
            </div>

            {message && (
                <div style={{ color: "green", marginTop: 16, textAlign: "center", padding: 12, background: "#f0f9ff", borderRadius: 4 }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ color: "red", marginTop: 16, textAlign: "center", padding: 12, background: "#fef2f2", borderRadius: 4 }}>
                    {error}
                </div>
            )}
        </div>
    );
} 
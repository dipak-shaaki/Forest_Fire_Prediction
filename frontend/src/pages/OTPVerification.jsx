import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OTPVerification() {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Get email from URL params or localStorage
        const emailFromParams = searchParams.get("email");
        const emailFromStorage = localStorage.getItem("pendingVerificationEmail");

        if (emailFromParams) {
            setEmail(emailFromParams);
        } else if (emailFromStorage) {
            setEmail(emailFromStorage);
        } else {
            // Redirect to login if no email found
            navigate("/login");
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        // Start countdown for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const { data } = await axios.post("http://localhost:8000/verify-otp", {
                email: email,
                otp: otp
            });

            setMessage(data.message);
            localStorage.removeItem("pendingVerificationEmail");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error("OTP verification error:", err);
            let errorMessage = "Verification failed. Please try again.";

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

    const handleResendOTP = async () => {
        setResendLoading(true);
        setError("");

        try {
            const { data } = await axios.post("http://localhost:8000/resend-otp", {
                email: email
            });

            setMessage(data.message);
            setCountdown(60); // 60 seconds countdown

        } catch (err) {
            console.error("Resend OTP error:", err);
            let errorMessage = "Failed to resend OTP. Please try again.";

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            }

            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>Email Verification</h2>

            <p style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>
                We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                        Enter OTP:
                    </label>
                    <input
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        style={{
                            width: "100%",
                            padding: 12,
                            fontSize: 18,
                            textAlign: "center",
                            letterSpacing: 8,
                            border: "2px solid #ddd",
                            borderRadius: 4,
                            outline: "none"
                        }}
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    style={{
                        width: "100%",
                        padding: 12,
                        background: loading || otp.length !== 6 ? "#ccc" : "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 16,
                        cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer",
                        marginBottom: 16
                    }}
                >
                    {loading ? "Verifying..." : "Verify Email"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
                <p style={{ marginBottom: 10, color: "#666" }}>
                    Didn't receive the OTP?
                </p>
                <button
                    onClick={handleResendOTP}
                    disabled={resendLoading || countdown > 0}
                    style={{
                        background: "none",
                        border: "none",
                        color: resendLoading || countdown > 0 ? "#ccc" : "#2563eb",
                        cursor: resendLoading || countdown > 0 ? "not-allowed" : "pointer",
                        textDecoration: "underline"
                    }}
                >
                    {resendLoading ? "Sending..." :
                        countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
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
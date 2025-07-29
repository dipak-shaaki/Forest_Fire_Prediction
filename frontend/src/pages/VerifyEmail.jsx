import React, { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyEmail() {
    const [message, setMessage] = useState("Verifying...");
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const email = params.get("email");
        if (token && email) {
            axios
                .get(`http://localhost:8000/verify-email?token=${token}&email=${email}`)
                .then((res) => setMessage(res.data.message || "Email verified!"))
                .catch((err) =>
                    setMessage(
                        err.response?.data?.detail ||
                        err.response?.data?.message ||
                        "Verification failed."
                    )
                );
        } else {
            setMessage("Invalid verification link.");
        }
    }, []);
    return (
        <div style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
            <h2>Email Verification</h2>
            <p>{message}</p>
        </div>
    );
}

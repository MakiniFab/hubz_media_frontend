import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ResetPassword.css"; 

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // toggle state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const tempToken = localStorage.getItem("temp_token");
    if (!tempToken) {
      setError("No temporary token found. Please login again.");
      return;
    }

    try {
      await axios.post(
        "https://hubz-media-backend.onrender.com/auth/change-password",
        { new_password: newPassword },
        {
          headers: { Authorization: `Bearer ${tempToken}` },
        }
      );

      setSuccess("Password updated successfully. Please login again.");
      localStorage.removeItem("temp_token");

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.msg || "Failed to reset password");
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Your Password</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={onSubmit}>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "35%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "1.1rem",
              userSelect: "none",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";

export default function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://hubz-media-backend.onrender.com/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.msg || "Failed to update password" });
      } else {
        setMessage({ type: "success", text: data.msg });
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      {message && (
        <p className={message.type === "error" ? "error-msg" : "success-msg"}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        {/* Old Password */}
        <div className="input-group">
          <label>Old Password</label>
          <div className="password-wrapper">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowOld((prev) => !prev)}
            >
              {showOld ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="input-group">
          <label>New Password</label>
          <div className="password-wrapper">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowNew((prev) => !prev)}
            >
              {showNew ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="input-group">
          <label>Confirm New Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
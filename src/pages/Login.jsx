import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Call backend login endpoint
      const res = await axios.post(
        "https://hubz-media-backend.onrender.com/auth/login",
        { email, password }
      );

      // Backend may return either normal login or must_change_password
      const { access_token, user, must_change_password } = res.data;

      if (must_change_password) {
        // Temporary password login → store temp token and redirect to reset
        localStorage.setItem("temp_token", access_token);
        navigate("/reset-password"); // create this page for changing password
        return;
      }

      // Normal login → store regular token and user details
      localStorage.setItem("token", access_token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("role", user.role || "journalist");
      localStorage.setItem("name", user.name || "No Name");
      localStorage.setItem("email", user.email || "");

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      <form onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div
          style={{ position: "relative", width: "90%", margin: "0 auto 15px auto" }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <button type="submit">Login</button>
      </form>
      <p className="login-reset-link">
        <Link
          to="/reset"
          style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
        >
          Forgot password?
        </Link>
      </p>
      <p className="redirect-text">
        Don’t have an account?{" "}
        <a href="/register" className="login-register-link">
          Register here
        </a>
      </p>
    </div>
  );
}

export default Login;
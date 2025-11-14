import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "journalist",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Validation functions
  const isValidEmail = (email) => /^[^\s@]+@gmail\.com$/.test(email);

  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!formData.name.trim()) {
      setMessage("❌ Name cannot be empty");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setMessage("❌ Please enter a valid Gmail address (example@gmail.com).");
      return;
    }
    try {
      // API call to backend
      const res = await fetch("https://hubz-media-backend.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage(`❌ ${data.msg || "Registration failed"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error. Try again later.");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            borderColor: !formData.name ? "" : formData.name.trim() ? "green" : "red",
          }}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{
            borderColor:
              !formData.email
                ? ""
                : isValidEmail(formData.email)
                ? "green"
                : "red",
          }}
        />
        {!isValidEmail(formData.email) && formData.email && (
          <small style={{ color: "red" }}>
            Must be a valid Gmail address (example@gmail.com)
          </small>
        )}

        {/* Password input with eye toggle */}
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              borderColor:
                !formData.password
                  ? ""
                  : isValidPassword(formData.password)
                  ? "green"
                  : "red",
            }}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option className="register-select" value="journalist">Journalist</option>
          <option className="register-select" value="attachment">Attachment</option>
        </select>

        <button className="register-button" type="submit">Register</button>
      </form>

      {message && (
        <p
          className="message"
          style={{ color: message.startsWith("✅") ? "green" : "red" }}
        >
          {message}
        </p>
      )}
      <p className="register-link" >
        Already have an account? <a href="/">Login here</a>
      </p>
    </div>
  );
};

export default Register;
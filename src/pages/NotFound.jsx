import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); 
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    navigate("/");
  };

  return (
    <button
      className="logout-btn"
      onClick={handleLogout}
      style={{ fontSize: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}
      title="Logout"
    >
      <span className="material-symbols-outlined">logout</span>
    </button>
  );
}
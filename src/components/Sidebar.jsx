import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="hamburger" onClick={toggleSidebar}>
        {isOpen ? "✖" : "☰"}
      </div>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Menu</h2>
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard" onClick={toggleSidebar}>Home</Link>
          </li>
          <li>
            <Link to="/approved" onClick={toggleSidebar}>Approved</Link>
          </li>
          <li>
            <Link to="/rejected" onClick={toggleSidebar}>Not Approved</Link>
          </li>
          <li>
            <Link to="/messages" onClick={toggleSidebar}>Chatroom</Link>
          </li>
          <li>
            <Link to="/analytics" onClick={toggleSidebar}>Leaderboards</Link>
          </li>
        </ul>
      </div>

      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
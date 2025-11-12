import React from "react";
import "../styles/Layout.css"; // CSS for footer styling

export default function Layout() {
  return (
    <footer className="layout-footer">
      <div className="footer-details">
        <p>📞 +254 712 345 678 </p>
        <p> ✉️ info@example.com</p>
        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
}

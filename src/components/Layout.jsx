import React from "react";
import "../styles/Layout.css"; // CSS for footer styling

export default function Layout() {
  return (
    <footer className="layout-footer">
      <div className="footer-details">
        <p>📞 +254 727 045 543 </p>
        <p> ✉️ info@hubzmedia.africa</p>
        <p>© {new Date().getFullYear()} Eldoret Hub Media. All rights reserved.</p>
      </div>
    </footer>
  );
}

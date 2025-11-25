import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://hubz-media-backend.onrender.com/files";
const PROFILE_API = "https://hubz-media-backend.onrender.com/auth/profile";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState({});
  const [filterMode, setFilterMode] = useState("ALL"); // "ALL" or "MINE"

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentAdminName = localStorage.getItem("name") || "";

  // Fetch submissions
  const fetchSubmissions = async () => {
    if (!token) {
      setError("No auth token found. Please log in.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
      await fetchAuthorsParallel(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch author profiles in parallel
  const fetchAuthorsParallel = async (subs) => {
    const uniqueAuthorIds = [...new Set(subs.map((s) => s.author_id))].filter(
      (id) => !authors[id]
    );

    if (uniqueAuthorIds.length === 0) return;

    try {
      const requests = uniqueAuthorIds.map((id) =>
        axios
          .get(`${PROFILE_API}/${id}`)
          .then((res) => ({ id, data: res.data }))
          .catch(() => ({ id, data: { name: `User ${id}`, role: "N/A" } }))
      );

      const results = await Promise.all(requests);
      const newAuthors = {};
      results.forEach((r) => {
        newAuthors[r.id] = {
          name: r.data.name,
          role: r.data.role,
        };
      });
      setAuthors((prev) => ({ ...prev, ...newAuthors }));
    } catch (err) {
      console.error("Error fetching author profiles:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateSubmission = async (id, status, rating) => {
    try {
      await axios.put(
        `${API_BASE}/update/${id}`,
        { status, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert(
        "Failed to update submission: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?"))
      return;
    try {
      await axios.delete(`${API_BASE}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert(
        "Failed to delete submission: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const viewFile = async (filename) => {
    try {
      const res = await axios.get(`${API_BASE}/view/${filename}`);
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error(err);
      alert(
        "Failed to view file: " + (err.response?.data?.error || err.message)
      );
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading submissions...</p>
      </div>
    );
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <Sidebar />

      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={() => navigate("/dashboard")} className="home-button">
          Home
        </button>
      </div>

      {/* 🔥 New Tab Bar */}
      <div className="tab-bar">
        <div
          className={`tab-item ${filterMode === "ALL" ? "active" : ""}`}
          onClick={() => setFilterMode("ALL")}
        >
          <span className="material-symbols-outlined">groups</span>
          <p>All Submissions</p>
        </div>

        <div
          className={`tab-item ${filterMode === "MINE" ? "active" : ""}`}
          onClick={() => setFilterMode("MINE")}
        >
          <span className="material-symbols-outlined">person</span>
          <p>To Me</p>
        </div>
      </div>

      <div className="admin-cards-container">
        {submissions
          .filter((s) => {
            if (filterMode === "ALL") return true;

            // FilterMode === "MINE"
            const match = s.title.match(/^\[TO:\s*(.+?)\]/);
            if (!match) return false;

            const target = match[1].trim();
            return target === currentAdminName;   // ONLY show mine
          })
          .map((s) => {
            const author =
              authors[s.author_id] || { name: s.author_id, role: "N/A" };

            return (
              <div key={s.id} className="admin-submission-card">
                <div className="admin-card-header">
                  <strong>{s.title}</strong>
                  <span className="admin-author-name">
                    By: <strong>{author.name}</strong> ({author.role})
                  </span>
                </div>

                <div className="admin-card-body">
                  <button
                    className="admin-view-btn"
                    onClick={() => viewFile(s.filename)}
                  >
                    View File
                  </button>

                  <div className="admin-status-rating">
                    <select
                      value={s.status}
                      onChange={(e) =>
                        updateSubmission(s.id, e.target.value, s.rating)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="featured">Featured</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    className="admin-delete-btn"
                    onClick={() => deleteSubmission(s.id)}
                  >
                    Delete
                  </button>

                  <button
                    className="admin-comment-btn"
                    onClick={() => navigate(`/comments/${s.id}`)}
                  >
                    Comment
                  </button>
                </div>

                <div className="admin-card-footer">
                  <small>
                    Created: {new Date(s.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/files";
const PROFILE_API = "http://localhost:5000/auth/profile"; // will append user_id

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState({}); 
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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
          .catch(() => ({ id, data: { name: `User ${id}`, email: "N/A" } }))
      );

      const results = await Promise.all(requests);
      const newAuthors = {};
      results.forEach((r) => {
        newAuthors[r.id] = { name: r.data.name, email: r.data.email };
      });
      setAuthors((prev) => ({ ...prev, ...newAuthors }));
    } catch (err) {
      console.error("Error fetching author profiles:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      alert("Failed to update submission: " + (err.response?.data?.error || err.message));
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      await axios.delete(`${API_BASE}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete submission: " + (err.response?.data?.error || err.message));
    }
  };

  const viewFile = async (filename) => {
    try {
      const res = await axios.get(`${API_BASE}/view/${filename}`);
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to view file: " + (err.response?.data?.error || err.message));
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
      <h2>Admin Dashboard</h2>
      <button
        onClick={() => navigate("/dashboard")}
        className="home-button"
      ></button>
      <div className="admin-cards-container">
        {submissions.map((s) => {
          const author = authors[s.author_id] || { name: s.author_id, email: "N/A" };
          return (
            <div key={s.id} className="admin-submission-card">
              <div className="admin-card-header">
                <strong>{s.title}</strong>
                <span className="admin-author-name">
                  By: {author.name} ({author.email})
                </span>
              </div>
              <div className="admin-card-body">
                <button className="admin-view-btn" onClick={() => viewFile(s.filename)}>
                  View File
                </button>
                <div className="admin-status-rating">
                  <select
                    value={s.status}
                    onChange={(e) => updateSubmission(s.id, e.target.value, s.rating)}
                  >
                    <option value="admin-pending">Pending</option>
                    <option value="admin-approved">Approved</option>
                    <option value="admin-rejected">Rejected</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={s.rating || ""}
                    onChange={(e) =>
                      updateSubmission(s.id, s.status, parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <button className="admin-delete-btn" onClick={() => deleteSubmission(s.id)}>
                  Delete
                </button>
                <button
                  className="admin-comment-btn"
                  onClick={() => navigate(`/comment/${s.id}`)}
                >
                  Comment
                </button>
              </div>
              <div className="admin-card-footer">
                <small>Created: {new Date(s.created_at).toLocaleString()}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
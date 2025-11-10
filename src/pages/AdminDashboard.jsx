import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const token = localStorage.getItem("token");

  // ---------------------------
  // Fetch all submissions
  // ---------------------------
  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://127.0.0.1:5000/submissions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // ---------------------------
  // Admin update: status/rating
  // ---------------------------
  const handleUpdate = async (id, field, value) => {
    try {
      await axios.patch(
        `http://127.0.0.1:5000/submissions/${id}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubmissions();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // ---------------------------
  // Admin delete submission
  // ---------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;

    try {
      await axios.delete(`http://127.0.0.1:5000/submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubmissions();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ---------------------------
  // Upload new file
  // ---------------------------
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:5000/submissions/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type manually for multipart/form-data
        },
      });
      setFile(null);
      fetchSubmissions();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
      </header>

      <section className="upload-section">
        <h3>Upload New File</h3>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Upload</button>
        </form>
      </section>

      <section className="submissions-section">
        <h3>All Submissions</h3>
        {loading && <p>Loading submissions...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && submissions.length === 0 && <p>No submissions found.</p>}

        {!loading && submissions.length > 0 && (
          <div className="submission-grid">
            {submissions.map((sub) => {
              const { mimetype, file_url, title, id, status, rating, author_id, created_at } = sub;

              // Display a clickable link for any file type
              const public_url = `https://YOUR_SUPABASE_PROJECT_URL.supabase.co/storage/v1/object/public/submissions/${file_url}`;

              const isImage = mimetype?.startsWith("image/");
              const isVideo = mimetype?.startsWith("video/");
              const isAudio = mimetype?.startsWith("audio/");

              return (
                <div key={id} className="submission-card">
                  <div className="thumbnail">
                    {isImage && <img src={public_url} alt={title} />}
                    {isVideo && (
                      <video src={public_url} controls width="100%" height="100%" preload="metadata" />
                    )}
                    {isAudio && <audio src={public_url} controls />}
                    {!isImage && !isVideo && !isAudio && (
                      <a href={public_url} target="_blank" rel="noopener noreferrer">
                        View File
                      </a>
                    )}
                  </div>

                  <div className="submission-info">
                    <h4>{title}</h4>
                    <p><strong>Author ID:</strong> {author_id}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <select value={status} onChange={(e) => handleUpdate(id, "status", e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </p>
                    <p>
                      <strong>Rating:</strong>{" "}
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={rating || ""}
                        onChange={(e) => handleUpdate(id, "rating", e.target.value)}
                      />
                    </p>
                    <p className="date">{new Date(created_at).toLocaleString()}</p>
                    <button className="delete-btn" onClick={() => handleDelete(id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;

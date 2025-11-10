import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [errorSubs, setErrorSubs] = useState(null);

  // Retrieve user data from localStorage
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name");
  const userEmail = localStorage.getItem("email");

  // ---------------------------
  // Fetch user's submissions
  // ---------------------------
  const fetchSubmissions = async () => {
    setLoadingSubs(true);
    setErrorSubs(null);
    try {
      const res = await axios.get("http://127.0.0.1:5000/submissions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setErrorSubs("Failed to fetch submissions.");
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // ---------------------------
  // Handle file upload
  // ---------------------------
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/submissions/upload-url",
        {
          filename: file.name,
          title: title || file.name,
          mimetype: file.type || "application/octet-stream",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { upload_url, submission_id } = res.data;
      console.log("Upload URL:", upload_url);

      try {
        await axios.put(upload_url, file, {
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
      } catch (err) {
        if (err.response && err.response.status === 400) {
          console.warn("Supabase 400 warning:", err.message);
        } else {
          throw err;
        }
      }

      setMessage(`✅ File uploaded successfully! Submission ID: ${submission_id}`);
      setTitle("");
      setFile(null);
      fetchSubmissions();
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------
  // Helper: Default Thumbnail
  // ---------------------------
  const getThumbnail = (mimetype) => {
    if (!mimetype) return "📁";
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.startsWith("video/")) return "🎬";
    if (mimetype.startsWith("audio/")) return "🎵";
    if (mimetype === "application/pdf") return "📄";
    if (mimetype.startsWith("text/")) return "📝";
    return "📎";
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h2>Welcome, {userName || "User"} 👋</h2>
          <p>{userEmail}</p>
        </div>
      </header>

      {/* Upload Section */}
      <section className="upload-section">
        <h3>Upload New Submission</h3>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {message && <p className="message">{message}</p>}
      </section>

      {/* Submissions Section */}
      <section className="submissions-section">
        <h3>Your Submissions</h3>
        {loadingSubs && <p>Loading submissions...</p>}
        {errorSubs && <p className="error-text">{errorSubs}</p>}
        {!loadingSubs && submissions.length === 0 && <p>No submissions found.</p>}

        {!loadingSubs && submissions.length > 0 && (
          <div className="submission-grid">
            {submissions.map((sub) => {
              const fileUrl = `https://YOUR_SUPABASE_PROJECT_URL.supabase.co/storage/v1/object/public/submissions/${sub.file_url}`;

              return (
                <div key={sub.id} className="submission-card">
                  <div className="thumbnail">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <div className="file-icon">{getThumbnail(sub.mimetype)}</div>
                    </a>
                  </div>

                  <div className="submission-info">
                    <h4>{sub.title}</h4>
                    <p>
                      <strong>Status:</strong> {sub.status}
                    </p>
                    <p>
                      <strong>Rating:</strong> {sub.rating || "N/A"}
                    </p>
                    <p className="date">
                      {new Date(sub.created_at).toLocaleString()}
                    </p>
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

export default Dashboard;
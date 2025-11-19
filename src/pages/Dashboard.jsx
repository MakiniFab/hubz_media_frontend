import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const API_BASE = "https://hubz-media-backend.onrender.com/files";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [authors, setAuthors] = useState({});
  const PROFILE_API = "https://hubz-media-backend.onrender.com/auth/profile";
  const [user, setUser] = useState({ name: "", email: "", role: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("name") || "Guest User";
    const storedEmail = localStorage.getItem("email") || "guest@example.com";
    const storedRole = localStorage.getItem("role") || "user";
    setUser({ name: storedName, email: storedEmail, role: storedRole });
    fetchFiles();
  }, []);

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

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = parseInt(localStorage.getItem("id")); 
      const filteredFiles = res.data.filter(
        (file) => file.author_id === userId || file.status === "approved"
      );

      setFiles(filteredFiles);
      fetchAuthorsParallel(filteredFiles); 
    } catch (err) {
      console.error("Error fetching files:", err);
      setMessage(
        err.response?.status === 401
          ? "Unauthorized: Please log in again."
          : "Failed to load files."
      );
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title || selectedFile.name);

    try {
      setUploading(true);
      setMessage("");

      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setMessage(`Uploading... ${percentCompleted}%`);
        },
      });

      setMessage(res.data.message || "File uploaded successfully!");
      fetchFiles();
      setSelectedFile(null);
      setTitle("");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(err.response?.status === 401 ? "Unauthorized: Please log in again." : "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (filename) => {
    try {
      const res = await axios.get(`${API_BASE}/view/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Error generating file URL:", err);
      setMessage("Could not view file.");
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) return "🎬";
    if (["mp3", "wav", "aac"].includes(ext)) return "🎵";
    if (["jpg", "png", "gif", "jpeg", "webp"].includes(ext)) return "🖼️";
    if (["pdf", "docx", "txt"].includes(ext)) return "📄";
    return "📁";
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <header className="dashboard-header">
        <div>
          {user.role === "admin" && (
            <button
              className="admin-btn"
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>
          )}
          <p>Welcome back, <strong>{user.name}</strong></p>
          <span className="user-email">{user.email}</span>
        </div>
      </header>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          disabled={uploading}
        />
        <input
          type="text"
          placeholder="Enter a description for your article"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      {uploading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      <hr />

      {/* Files List */}
      <section className="files-section">
        <h2>Uploaded Files</h2>
        {files.length === 0 ? (
          <p>No files found.</p>
        ) : (
          <div className="card-container">
            {files.map((file) => (
              <div className="file-card" key={file.id}>
                <div className="file-icon">{getFileIcon(file.filename)}</div>
                <p className="file-author">
                  Author: {authors[file.author_id]?.name || "Loading..."}
                </p>
                <p className="file-created_at">
                  Submitted on:{" "}
                  {new Date(file.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
                <h3 className="file-name">{file.filename}</h3>
                <p className="file-title">{file.title}</p>
                <button onClick={() => handleView(file.filename)} className="view-btn">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      marginRight: "8px"
                    }}
                  >
                    download
                  </span>
                </button><br></br>
                <button
                  onClick={() => navigate(`/comments/${file.id}`)}
                  className="dash-comment-btn"
                >
                  Comments
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
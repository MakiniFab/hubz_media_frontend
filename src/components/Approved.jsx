import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../styles/Approved.css"

const FILES_API = "http://localhost:5000/files";
const COMMENTS_API = "http://localhost:5000/comments";

export default function Approved() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApprovedFiles();
  }, []);

  // Fetch approved submissions
  const fetchApprovedFiles = async () => {
    try {
      const res = await axios.get(`${FILES_API}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approved = res.data.filter((f) => f.status === "approved");

      if (approved.length === 0) {
        setMessage("No approved submissions found.");
        setLoading(false);
        return;
      }

      // Fetch comments for each approved submission
      const withComments = await Promise.all(
        approved.map(async (file) => {
          try {
            const commentsRes = await axios.get(
              `${COMMENTS_API}/submission/${file.id}/comments`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...file, comments: commentsRes.data };
          } catch (err) {
            console.error(`Error fetching comments for file ${file.id}:`, err);
            return { ...file, comments: [] };
          }
        })
      );

      setFiles(withComments);
    } catch (err) {
      console.error("Error fetching approved submissions:", err);
      setMessage("Failed to load approved submissions.");
    } finally {
      setLoading(false);
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
    <div className="dashboard-approved-container">
      <Sidebar />
      <header className="dashboard-approved-header">
        <h1>✅ Approved Submissions</h1>
      </header>

      {loading ? (
        <p>Loading submissions...</p>
      ) : files.length === 0 ? (
        <p className="message-approved">{message}</p>
      ) : (
        <div className="cards-approved-container">
          {files.map((file) => (
            <div className="file-card-approved" key={file.id}>
              <div className="file-icon-approved">{getFileIcon(file.filename)}</div>
              <h3 className="file-name-approved">{file.filename}</h3>
              <p className="file-title-approved">{file.title}</p>
              <p className="Rated-approved">{file.rating}</p>
              {/* Comments Section */}
              <div className="comments-section-approved">
                <h4>💬 Comments</h4>
                {file.comments && file.comments.length > 0 ? (
                  <ul className="comments-list-approved">
                    {file.comments.map((c) => (
                      <li key={c.id} className="comment-item-approved">
                        <span className="comment-content-approved">{c.content}</span>
                        <small className="comment-date-approved">
                          {new Date(c.created_at).toLocaleString()}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-comments-approved">No comments yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
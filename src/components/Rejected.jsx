import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../styles/Rejected.css"

const FILES_API = "http://localhost:5000/files";
const COMMENTS_API = "http://localhost:5000/comments";

export default function Rejected() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRejectedFiles();
  }, []);

  const fetchRejectedFiles = async () => {
    try {
      const res = await axios.get(`${FILES_API}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = parseInt(localStorage.getItem("id"));
      const rejected = res.data.filter(
        (f) => f.status === "rejected" && f.author_id === userId
      );
      if (rejected.length === 0) {
        setMessage("No rejected submissions found.");
        setLoading(false);
        return;
      }

      const withComments = await Promise.all(
        rejected.map(async (file) => {
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
      console.error("Error fetching rejected submissions:", err);
      setMessage("Failed to load rejected submissions.");
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
    <div className="dashboard-rejected-container">
      <Sidebar />
      <header className="dashboard-rejected-header">
        <h1>❌ Rejected Submissions</h1>
      </header>

      {loading ? (
        <p>Loading submissions...</p>
      ) : files.length === 0 ? (
        <p className="message-rejected">{message}</p>
      ) : (
        <div className="cards-rejected-container">
          {files.map((file) => (
            <div className="file-card-rejected" key={file.id}>
              <div className="file-icon-rejected">{getFileIcon(file.filename)}</div>
              <h3 className="file-name-rejected">{file.filename}</h3>
              <p className="file-title-rejected">{file.title}</p>
              <p className="Rated-rejected">{file.rating}</p>
              {/* Comments Section */}
              <div className="comments-section-rejected">
                <h4>💬 Comments</h4>
                {file.comments && file.comments.length > 0 ? (
                  <ul className="comments-list-rejected">
                    {file.comments.map((c) => (
                      <li key={c.id} className="comment-item-rejected">
                        <span className="comment-content-rejected">{c.content}</span>
                        <small className="comment-date-rejected">
                          {new Date(c.created_at).toLocaleString()}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-comments-rejected">No comments yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
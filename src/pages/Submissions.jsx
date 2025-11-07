import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Submissions.css";

function Submissions() {
  const [subs, setSubs] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await API.get("/submissions");
      setSubs(data);
    };
    load();
  }, []);

  const addComment = async (id) => {
    if (!commentText) return;
    try {
      await API.post(`/submissions/${id}/comment`, { text: commentText });
      alert("Comment added!");
      setCommentText("");
    } catch {
      alert("Only allowed to comment on approved submissions.");
    }
  };

  return (
    <div className="submissions">
      <h2>Submissions</h2>
      {subs.length === 0 && <p>No submissions yet</p>}
      {subs.map((s) => (
        <div key={s.id} className="submission-card">
          <h4>{s.title}</h4>
          <p>{s.content}</p>
          <span className={`status ${s.status}`}>{s.status}</span>
          {s.file_url && (
            <a href={s.file_url} target="_blank" rel="noreferrer">
              View File
            </a>
          )}
          {s.status === "approved" && (
            <div className="comment-box">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add comment..."
              />
              <button onClick={() => addComment(s.id)}>Post</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Submissions;
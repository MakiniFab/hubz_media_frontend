import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/CommentPage.css";

const CommentPage = () => {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // ✅ FIXED — Backend returns an array, not { comments: [...] }
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/comments/submission/${id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data); // ✅ use res.data directly
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return toast.warning("Comment cannot be empty");
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/comments/submission/${id}/comment`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Comment added successfully");
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  return (
    <div className="comment-page">
      <h1 className="comment-title">Comments for Submission #{id}</h1>

      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="comment-input"
          rows="3"
        />
        <button type="submit" disabled={loading} className="comment-btn">
          {loading ? "Posting..." : "Add Comment"}
        </button>
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p className="comment-text">{comment.content}</p>
              <p className="comment-meta">
                Admin comment: •{" "}
                {new Date(comment.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CommentPage;
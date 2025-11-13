import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import "../styles/CommentPage.css";

const CommentPage = () => {
  const { id } = useParams(); // submission ID
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(""); // ⭐ new rating input
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch comments for the submission
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://hubz-media-backend.onrender.com/comments/submission/${id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched comments:", res.data);
      setComments(res.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  // Add a new comment with optional rating
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return toast.warning("Comment cannot be empty");
    setLoading(true);
    try {
      await axios.post(
        `https://hubz-media-backend.onrender.com/comments/submission/${id}/comment`,
        {
          content: newComment,
          rating: rating ? Number(rating) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Comment added successfully");
      setNewComment("");
      setRating("");
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
      <Sidebar />
      <h1 className="comment-title">Comments for Submission #{id}</h1>

      {/* --- Add comment form --- */}
      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="comment-input"
          rows="3"
        />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="0-9"
          className="comment-rating"
          min="0"
          max="9"
        />
        <button type="submit" disabled={loading} className="comment-btn">
          {loading ? "Posting..." : "Add Comment"}
        </button>
      </form>

      {/* --- Comment list --- */}
      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p className="comment-text">{comment.content}</p>
              {comment.rating && (
                <p className="comment-rating-display">⭐ Rating: {comment.rating}</p>
              )}
              <p className="comment-meta">
                Comment by:{" "}
                <strong>
                  {comment.admin_name || comment.admin?.name || "Unknown"}
                </strong>{" "}
                • {new Date(comment.created_at).toLocaleString()}
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
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PrivateSend.css";
import { toast } from "react-toastify";

const API_BASE = "https://hubz-media-backend.onrender.com";

export default function PrivateSend() {
  const token = localStorage.getItem("token");
  const userId = parseInt(localStorage.getItem("id"));

  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------
  // Fetch submissions (all user submissions) + all users
  // ------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const filesRes = await axios.get(`${API_BASE}/files/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // store: title, file_url, filename, author_id, etc
        setSubmissions(filesRes.data.filter(f => f.author_id === userId));

        const usersRes = await axios.get(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch submissions or users");
      }
    };
    fetchData();
  }, [token, userId]);

  // ------------------------------------------------------
  // Fetch private messages sent to this user
  // ------------------------------------------------------
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/messages/chat/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userMessages = res.data.filter(msg => {
        try {
          const parsed = JSON.parse(msg.content);
          return parsed.receiver_id === userId;
        } catch {
          return false;
        }
      });

      setMessages(userMessages.reverse());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ------------------------------------------------------
  // View file securely (using filename)
  // ------------------------------------------------------
  const handleView = async (filename) => {
    try {
      const res = await axios.get(`${API_BASE}/view/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Error opening file:", err);
      toast.error("Could not view file.");
    }
  };

  // ------------------------------------------------------
  // Send message containing file info
  // ------------------------------------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedSubmission || !selectedUser)
      return toast.warning("Select a submission and a user");

    setLoading(true);

    try {
      const sub = submissions.find(s => s.id === parseInt(selectedSubmission));

      const content = {
        file_url: sub.file_url,
        filename: sub.filename, 
        title: sub.title,
        receiver_id: parseInt(selectedUser)
      };
      console.log("Sending message:", content);
      await axios.post(
        `${API_BASE}/messages/chat/send`,
        { content: JSON.stringify(content) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Message sent!");
      setSelectedSubmission("");
      setSelectedUser("");
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="private-container">
      <h2 className="main-title">Private Messaging</h2>

      {/* SEND SECTION */}
      <div className="send-card">
        <h3>Send a Submission</h3>

        {/* Select user submission */}
        <select
          value={selectedSubmission}
          onChange={(e) => setSelectedSubmission(e.target.value)}
        >
          <option value="">-- Select your submission --</option>
          {submissions.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.title} — ({sub.filename})
            </option>
          ))}
        </select>

        {/* Select user */}
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select user --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* RECEIVED MESSAGES */}
      <h3 className="sub-title">Messages Sent To You</h3>

      <div className="messages-wrapper">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            let parsed = {};
            try {
              parsed = JSON.parse(msg.content);
            } catch {}

            return (
              <div key={msg.id} className="message-bubble received">

                {/* FILE URL AT TOP */}
                <div className="message-top-url">
                  {parsed.file_url}
                </div>

                {/* Secure file viewer */}
                <button
                  className="view-btn"
                  onClick={() => handleView(parsed.filename)}
                >
                  View File
                </button>

                {/* File title */}
                <div className="message-info">
                  <strong>{parsed.title}</strong>
                </div>

                {/* Timestamp */}
                <div className="timestamp">
                  {new Date(msg.created_at).toLocaleString()}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
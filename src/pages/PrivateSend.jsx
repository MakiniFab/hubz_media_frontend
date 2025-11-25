import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/PrivateSend.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://hubz-media-backend.onrender.com";

export default function PrivateSend() {
  const [users, setUsers] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const me = parseInt(localStorage.getItem("id")); // your user id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all users except self
  useEffect(() => {
    axios
      .get(`${API_BASE}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const otherUsers = res.data.filter((u) => u.id !== me);
        setUsers(otherUsers);
      })
      .catch((err) => console.error(err));
  }, [me, token]);

  // Fetch private messages between me and recipient
  const loadMessages = async () => {
    if (!recipient) return;

    try {
      const res = await axios.get(`${API_BASE}/messages/chat/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter messages that start with "inbox:" and are between us
      const privateMsgs = res.data
        .filter((msg) => msg.content.startsWith("inbox:"))
        .filter((msg) => {
          const parts = msg.content.split(":");
          if (parts.length < 3) return false;

          const msgRecipientId = parseInt(parts[1]);
          const msgText = parts.slice(2).join(":");

          // Message is between me and recipient
          return (
            (msg.sender_id === me && msgRecipientId === recipient.id) ||
            (msg.sender_id === recipient.id && msgRecipientId === me)
          );
        })
        .map((msg) => {
          const parts = msg.content.split(":");
          return { ...msg, text: parts.slice(2).join(":") };
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setMessages(privateMsgs);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load private messages");
    }
  };

  // Poll messages every 4 seconds
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [recipient]);

  // Send private message
  const sendMessage = async () => {
    if (!recipient) return toast.error("Select a recipient first");
    if (!text.trim()) return toast.warning("Message cannot be empty");

    setLoading(true);
    try {
      const content = `inbox:${recipient.id}:${text}`;

      // Immediately push into state for instant display
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(), // temporary id
          sender_id: me,
          text,
          content,
          created_at: new Date().toISOString(),
        },
      ]);

      setText("");
      scrollToBottom();

      // Send to server
      await axios.post(
        `${API_BASE}/messages/chat/send`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="private-wrapper">
      <Sidebar />
      <div className="private-main">
        <h2>Private Inbox</h2>

        {/* User selector */}
        <div className="user-list">
          {users.map((u) => (
            <div
              key={u.id}
              className={`user-item ${recipient?.id === u.id ? "active" : ""}`}
              onClick={() => setRecipient(u)}
            >
              {u.name || u.fullname || u.email}
            </div>
          ))}
        </div>

        {/* Chat box */}
        {recipient && (
          <div className="chat-box">
            <h3>Chat with {recipient.name || recipient.fullname}</h3>
            <div className="messages">
              {messages.length === 0 && <p className="no-messages">No messages yet</p>}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${msg.sender_id === me ? "me" : "them"}`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="send-area">
              <input
                type="text"
                placeholder="Type message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}

        {!recipient && <p>Select a user to start chatting.</p>}

        <ToastContainer position="bottom-right" />
      </div>
    </div>
  );
}

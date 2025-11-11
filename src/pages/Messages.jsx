import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Messages.css";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null); // {id, sender_name, content}
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ---------------------------
  // Fetch all messages
  // ---------------------------
  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/messages/chat/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data); // messages are already ordered by created_at in backend
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    }
  };

  // Poll messages every 5 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // Send new message
  // ---------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return toast.warning("Message cannot be empty");

    setLoading(true);
    try {
      const payload = { content: newMessage };
      if (replyTo) payload.reply_to_id = replyTo.id;

      await axios.post("http://127.0.0.1:5000/messages/chat/send", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewMessage("");
      setReplyTo(null);
      fetchMessages();
      toast.success("Message sent!");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Reply to a message
  // ---------------------------
  const handleReply = (msg) => {
    setReplyTo({
      id: msg.id,
      sender_name: msg.sender_name,
      content: msg.content,
    });
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Global Chat Room</h1>

      {/* Messages list */}
      <div className="chat-messages">
        {messages.length === 0 && <p className="no-messages">No messages yet</p>}
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <p className="chat-sender">{msg.sender_name}:</p>

            {msg.reply_to_id && (
              <p className="chat-reply">
                Replying to {msg.reply_to_sender || "Unknown"}: "{msg.reply_to_content || ""}"
              </p>
            )}

            <p className="chat-content">{msg.content}</p>
            <button className="chat-reply-btn" onClick={() => handleReply(msg)}>
              Reply
            </button>
          </div>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="chat-form">
        {replyTo && (
          <p className="replying-to">
            Replying to {replyTo.sender_name}: "{replyTo.content}"{" "}
            <span className="cancel-reply" onClick={() => setReplyTo(null)}>
              [cancel]
            </span>
          </p>
        )}

        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows="3"
          className="chat-input"
        />
        <button type="submit" disabled={loading} className="chat-send-btn">
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Messages;
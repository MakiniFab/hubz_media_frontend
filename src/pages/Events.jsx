import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import Sidebar from "../components/Sidebar";
import "react-calendar/dist/Calendar.css";
import "../styles/Events.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // null = no filter
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    location: "",
    type: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" or "journalist"

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await axios.get("https://hubz-media-backend.onrender.com/events/events", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load events.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  // Handle create event (admin only)
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        "https://hubz-media-backend.onrender.com/events/events",
        newEvent,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Event created successfully!");
      setNewEvent({
        title: "",
        description: "",
        start_datetime: "",
        end_datetime: "",
        location: "",
        type: "",
      });
      fetchEvents();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Failed to create event.");
    }
  };

  // Handle delete event (admin only)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`https://hubz-media-backend.onrender.com/events/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to delete event.");
    }
  };

  // Sort events: today's events first, then future events
  const sortedEvents = [...events].sort((a, b) => {
    const today = new Date();
    const dateA = new Date(a.start_datetime);
    const dateB = new Date(b.start_datetime);

    // Today's events first
    if (dateA.toDateString() === today.toDateString() && dateB.toDateString() !== today.toDateString()) return -1;
    if (dateB.toDateString() === today.toDateString() && dateA.toDateString() !== today.toDateString()) return 1;

    // Otherwise sort chronologically
    return dateA - dateB;
  });

  // Filter by selected date if a date is picked
  const displayedEvents = selectedDate
    ? sortedEvents.filter((e) => {
        const start = new Date(e.start_datetime);
        const end = e.end_datetime ? new Date(e.end_datetime) : start;
        return selectedDate >= start && selectedDate <= end;
      })
    : sortedEvents;

  return (
    <div className="events-container">
        <Sidebar />
      <h2>Events Calendar</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {role === "admin" && (
        <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Event"}
        </button>
      )}

      {showForm && role === "admin" && (
        <form className="event-form" onSubmit={handleCreateEvent}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newEvent.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newEvent.description}
            onChange={handleChange}
          />
          <input
            type="datetime-local"
            name="start_datetime"
            value={newEvent.start_datetime}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="end_datetime"
            value={newEvent.end_datetime}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newEvent.location}
            onChange={handleChange}
          />
          <input
            type="text"
            name="type"
            placeholder="Type (e.g., Workshop, Meeting)"
            value={newEvent.type}
            onChange={handleChange}
          />
          <button type="submit">Create Event</button>
        </form>
      )}

      <div className="calendar-section">
        <Calendar onChange={setSelectedDate} value={selectedDate} />
        {selectedDate && (
          <button onClick={() => setSelectedDate(null)} className="clear-date-btn">
            Clear Filter
          </button>
        )}
      </div>

      <div className="events-list">
        {displayedEvents.length === 0 ? (
          <p>No events to display.</p>
        ) : (
          displayedEvents.map((e) => (
            <div key={e.id} className="event-card">
              <h3>{e.title}</h3>
              <p>{e.description}</p>
              <p>
                <strong>Start:</strong> {new Date(e.start_datetime).toLocaleString()}
              </p>
              {e.end_datetime && (
                <p>
                  <strong>End:</strong> {new Date(e.end_datetime).toLocaleString()}
                </p>
              )}
              {e.location && <p><strong>Location:</strong> {e.location}</p>}
              {e.type && <p><strong>Type:</strong> {e.type}</p>}
              <p><strong>Created by:</strong> {e.creator_name}</p>
              {role === "admin" && (
                <button className="delete-btn" onClick={() => handleDelete(e.id)}>
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Events;
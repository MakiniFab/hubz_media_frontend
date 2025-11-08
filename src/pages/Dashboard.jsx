import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const [userRole, setUserRole] = useState("");
  const [stats, setStats] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user role and submissions
  useEffect(() => {
    const fetchUserRole = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    };

    const fetchData = async () => {
      try {
        if (userRole === "admin" || userRole === "editor") {
          const { data } = await API.get("/analytics/overview");
          setStats(data);
        } else if (userRole === "journalist") {
          const { data } = await API.get("/submissions/");
          setMySubmissions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError("Unable to fetch dashboard data");
      }
    };

    fetchUserRole();
    fetchData();
  }, [userRole]);

  // Handle new submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle && !newContent && !newFile) {
      setError("Please provide a title, content, or file");
      return;
    }

    try {
      setLoading(true);

      let fileUrl = null;

      // If user selected a file, upload it first
      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);

        // Use your file upload endpoint (create one if needed)
        const uploadRes = await API.post("/upload_file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        fileUrl = uploadRes.data.file_url;
      }

      // Send submission to backend
      const { data } = await API.post("/submissions/", {
        title: newTitle,
        content: newContent,
        file_url: fileUrl,
      });

      // Update local state
      setMySubmissions((prev) => [
        {
          id: data.id,
          title: newTitle,
          content: newContent,
          status: "pending",
          file_url: fileUrl,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Reset form
      setNewTitle("");
      setNewContent("");
      setNewFile(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to create new submission");
    } finally {
      setLoading(false);
    }
  };

  if (!userRole) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {error && <p className="error">{error}</p>}

      {/* Admin / Editor View */}
      {(userRole === "admin" || userRole === "editor") && stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <h4>Total Submissions</h4>
            <p>{stats.total_submissions}</p>
          </div>
          <div className="stat-card">
            <h4>Approved</h4>
            <p>{stats.approved}</p>
          </div>
          <div className="stat-card">
            <h4>Rejected</h4>
            <p>{stats.rejected}</p>
          </div>
          <div className="stat-card">
            <h4>Approval Rate</h4>
            <p>{stats.approval_rate}%</p>
          </div>
        </div>
      )}

      {/* Journalist View */}
      {userRole === "journalist" && (
        <div className="journalist-submissions">
          <h3>My Submissions</h3>

          {/* New Submission Form */}
          <form onSubmit={handleSubmit} className="new-submission-form">
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            ></textarea>
            <input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0])}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Create Submission"}
            </button>
          </form>

          {/* Submissions Table */}
          {Array.isArray(mySubmissions) && mySubmissions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.title}</td>
                    <td>{sub.status}</td>
                    <td>{new Date(sub.created_at).toLocaleString()}</td>
                    <td>
                      {sub.file_url ? (
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer">
                          View File
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No submissions yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
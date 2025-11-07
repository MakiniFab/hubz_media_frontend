import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const [userRole, setUserRole] = useState("");
  const [stats, setStats] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [error, setError] = useState("");

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
          setMySubmissions(data);
        }
      } catch (err) {
        setError("Unable to fetch dashboard data");
      }
    };

    fetchUserRole();
    fetchData();
  }, [userRole]);

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
          {mySubmissions.length === 0 ? (
            <p>No submissions yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.title}</td>
                    <td>{sub.status}</td>
                    <td>{new Date(sub.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
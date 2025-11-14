// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/Analytics.css";

const API_BASE = "https://hubz-media-backend.onrender.com";
const token = localStorage.getItem("token");

export default function Analytics() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const usersRes = await axios.get(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const attachments = usersRes.data.filter(u => u.role === "attachment");

        const filesRes = await axios.get(`${API_BASE}/files/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const submissions = filesRes.data;

        const submissionComments = await Promise.all(
          submissions.map(async (s) => {
            const res = await axios.get(
              `${API_BASE}/comments/submission/${s.id}/comments`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { submission: s, comments: res.data };
          })
        );

        const globalMean = 3.5;
        const smoothing = 5;

        const leaderboardData = attachments.map(user => {
          const userSubmissions = submissionComments.filter(sc => sc.submission.author_id === user.id);
          const total = userSubmissions.length;

          const featured = userSubmissions.filter(us => us.submission.status === "featured").length;
          const approved = userSubmissions.filter(us => us.submission.status === "approved").length;
          const rejected = userSubmissions.filter(us => us.submission.status === "rejected").length;

          const approvalRatio = total > 0 ? ((featured + approved) / total) * 100 : 0;

          const allRatings = userSubmissions.flatMap(us =>
            us.comments.map(c => c.rating).filter(r => r !== null)
          );

          const avgRating = allRatings.length > 0
            ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
            : 0;

          const bayesianScore = allRatings.length > 0
            ? (avgRating * allRatings.length + globalMean * smoothing) / (allRatings.length + smoothing)
            : 0;

          return {
            id: user.id,
            name: user.name,
            totalSubmissions: total,
            featured,
            approved,
            rejected,
            approvalRatio,
            avgRating: avgRating.toFixed(2),
            bayesianScore: bayesianScore.toFixed(2),
          };
        });

        leaderboardData.sort((a, b) => b.bayesianScore - a.bayesianScore);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="analytics-container">
      <Sidebar />
      <div className="analytics-content">
        <h1>Attachment Leaderboard</h1>
        {loading ? (
          <p className="loading">Loading analytics...</p>
        ) : leaderboard.length === 0 ? (
          <p className="loading">No data available.</p>
        ) : (
          <div className="leaderboard-cards">
            {leaderboard.map((user, idx) => (
              <div className="leaderboard-card" key={user.id}>
                <h2>{idx + 1}. {user.name}</h2>
                <p><strong>Total Submissions:</strong> {user.totalSubmissions}</p>
                <p><strong>Featured:</strong> {user.featured} | <strong>Approved:</strong> {user.approved} | <strong>Rejected:</strong> {user.rejected}</p>
                <p><strong>Approval %:</strong> {user.approvalRatio.toFixed(1)}%</p>
                <p><strong>Avg Rating:</strong> {user.avgRating}</p>
                <p><strong>Bayesian Score:</strong> {user.bayesianScore}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "../styles/Analytics.css";

const API_BASE = "http://127.0.0.1:5000";

export default function Analytics() {
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/files/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(res.data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setMessage("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Analyze and compute leaderboard
  useEffect(() => {
    const analyze = async () => {
      if (!submissions.length) return;

      const grouped = {};
      submissions.forEach((s) => {
        const uid = s.author_id;
        if (!grouped[uid]) grouped[uid] = { ratings: [], statuses: [], count: 0 };
        grouped[uid].ratings.push(s.rating);
        grouped[uid].statuses.push(s.status);
        grouped[uid].count++;
      });

      // Cache user profiles to avoid duplicate requests
      const userProfiles = {};
      for (const uid of Object.keys(grouped)) {
        if (!userProfiles[uid]) {
          try {
            const res = await axios.get(`${API_BASE}/auth/profile/${uid}`);
            userProfiles[uid] = res.data;
          } catch (err) {
            console.warn(`Failed to load user ${uid}`, err);
          }
        }
      }

      // Compute stats
      const allRatings = submissions.map((s) => s.rating).filter((r) => r != null);
      const globalAvg =
        allRatings.reduce((a, b) => a + b, 0) / (allRatings.length || 1);
      const k = 5; // smoothing constant

      const leaderboard = Object.entries(grouped).map(([uid, data]) => {
        const ratings = data.ratings.filter((r) => r != null);
        const avgRating =
          ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);
        const approved = data.statuses.filter((s) =>
          s.toLowerCase().includes("approved")
        ).length;
        const approvalRatio = approved / data.count;

        // Bayesian adjusted score
        const adjusted =
          (avgRating * data.count + globalAvg * k) / (data.count + k);

        // Weighted blend of quality & activity
        const overall = (adjusted * 0.7 + Math.log(data.count + 1) * 0.3).toFixed(
          2
        );

        return {
          user_id: uid,
          name: userProfiles[uid]?.name || "Unknown User",
          email: userProfiles[uid]?.email || "N/A",
          submission_count: data.count,
          avg_rating: avgRating.toFixed(2),
          approval_ratio: approvalRatio.toFixed(2),
          overall_score: parseFloat(overall),
        };
      });

      leaderboard.sort((a, b) => b.overall_score - a.overall_score);
      setLeaderboard(leaderboard);
    };

    analyze();
  }, [submissions]);

  return (
    <div className="analytics-container">
      <Sidebar />
      <div className="analytics-content">
        <h1>📊 Submission Analytics</h1>

        {loading ? (
          <p>Loading data...</p>
        ) : message ? (
          <p className="error">{message}</p>
        ) : leaderboard.length === 0 ? (
          <p>No submissions found.</p>
        ) : (
          <>
            <div className="leaderboard-section">
              <h2>🏆 Leaderboard</h2>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Submissions</th>
                    <th>Avg Rating</th>
                    <th>Approval Ratio</th>
                    <th>Overall Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u, i) => (
                    <tr key={u.user_id}>
                      <td>{i + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.submission_count}</td>
                      <td>{u.avg_rating}</td>
                      <td>{u.approval_ratio}</td>
                      <td>{u.overall_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="chart-section">
              <h2>📈 Leaderboard Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaderboard}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="overall_score" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
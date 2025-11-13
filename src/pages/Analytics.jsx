// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/Analytics.css";

const API_BASE = "http://localhost:5000";
const token = localStorage.getItem("token");

export default function Analytics() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 1️⃣ Fetch all users
        const usersRes = await axios.get(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const attachments = usersRes.data.filter(u => u.role === "attachment");

        // 2️⃣ Fetch all submissions
        const filesRes = await axios.get(`${API_BASE}/files/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const submissions = filesRes.data;

        // 3️⃣ Fetch all comments per submission
        const submissionComments = await Promise.all(
          submissions.map(async (s) => {
            const res = await axios.get(`${API_BASE}/comments/submission/${s.id}/comments`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { submission: s, comments: res.data };
          })
        );

        // 4️⃣ Compute leaderboard
        const globalMean = 3.5; // fallback if no ratings
        const smoothing = 5;

        const leaderboardData = attachments.map(user => {
          const userSubmissions = submissionComments.filter(sc => sc.submission.author_id === user.id);
          const total = userSubmissions.length;

          if (total === 0) {
            return {
              id: user.id,
              name: user.name,
              totalSubmissions: 0,
              featured: 0,
              approved: 0,
              rejected: 0,
              approvalRatio: 0,
              avgRating: 0,
              bayesianScore: 0,
            };
          }

          const featured = userSubmissions.filter(us => us.submission.status === "featured").length;
          const approved = userSubmissions.filter(us => us.submission.status === "approved").length;
          const rejected = userSubmissions.filter(us => us.submission.status === "rejected").length;

          const approvalRatio = ((featured + approved) / total) * 100;

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

        // Sort descending by bayesian score
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
      <div className="analytics-description">
        <h2>How the Analysis Works</h2>
        <p>
          This leaderboard evaluates all attachments based on their submitted articles
          and the feedback received from reviewers. Each attachment’s submissions are 
          categorized as <strong>Featured</strong>, <strong>Approved</strong>, or 
          <strong>Rejected</strong>. Featured submissions indicate top-quality work, 
          Approved submissions are acceptable, and Rejected submissions need improvement.
        </p>
        <p>
          Additionally, each submission receives a rating from reviewers. The system 
          calculates both the <strong>average rating</strong> and a <strong>Bayesian-adjusted 
          score</strong> to account for differences in the number of reviews per attachment. 
          The approval ratio and these scores collectively determine the ranking on the leaderboard.
        </p>
        <p>
          This analysis is designed to provide a fair and comprehensive view of each attachment’s 
          performance, helping you understand your strengths and areas for improvement.
        </p>
      </div>
      <h1>Attachment Leaderboard</h1>
      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <table className="analytics-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Submissions</th>
              <th className="featured">Featured</th>
              <th className="approved">Approved</th>
              <th className="rejected">Rejected</th>
              <th>Approval %</th>
              <th>Avg Rating</th>
              <th>Bayesian Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((u, idx) => (
              <tr key={u.id}>
                <td>{idx + 1}</td>
                <td>{u.name}</td>
                <td>{u.totalSubmissions}</td>
                <td data-label="Featured"><span>{u.featured}</span></td>
                <td data-label="Approved"><span>{u.approved}</span></td>
                <td data-label="Rejected"><span>{u.rejected}</span></td>
                <td>{u.approvalRatio.toFixed(1)}%</td>
                <td>{u.avgRating}</td>
                <td>{u.bayesianScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
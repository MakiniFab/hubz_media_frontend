// src/pages/News.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/News.css";

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("https://hubz-media-backend.onrender.com/api/news");
        setArticles(res.data.articles);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch news");
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="news-container">
        <Sidebar />
      <h1>Latest News</h1>
      {loading && <p>Loading news...</p>}
      {error && <p className="error">{error}</p>}
      <div className="news-grid">
        {articles.map((article, idx) => (
          <div className="news-card" key={idx}>
            <h2 className="news-title">{article.title}</h2>
            <p className="news-meta">
              <span className="news-source">{article.source}</span> |{" "}
              {new Date(article.published).toLocaleString()}
            </p>
            <p className="news-summary">{article.summary}</p>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-link"
            >
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
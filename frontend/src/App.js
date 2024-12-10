import React, { useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const URLChecker = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post("http://localhost:5000/check-url", { url });
      setResult(response.data);
    } catch (error) {
      console.error("Error checking URL", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    if (result) {
      const cleanCount = result.cleanVendors.length;
      const unratedCount = result.unratedVendors.length;
      const maliciousCount = result.positives;

      return {
        labels: ["Clean", "Unrated", "Malicious"],
        datasets: [
          {
            data: [cleanCount, unratedCount, maliciousCount],
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
            hoverBackgroundColor: ["#218838", "#e0a800", "#c82333"],
          },
        ],
      };
    }
    return null;
  };

  return (
    <div className="container">
      <h1 className="header">Website Authenticity and Security Checker</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="url">Enter a URL to check:</label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://example.com"
          className="input"
        />
        <button type="submit" className="submit-btn">Check</button>
      </form>

      {loading && <p>Loading...</p>}

      {result && (
        <div className="result">
          <h2>Results for: {url}</h2>
          <p><strong>Scan date:</strong> {result.scan_date}</p>
          <p><strong>Positives:</strong> {result.positives} / {result.total}</p>
          <p><strong>Virus:</strong> {((result.positives/result.total)*100).toFixed(2)}%</p>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Detected as clean by:</strong> {result.cleanVendors.join(", ")}</p>
          {result.unrated && (
            <p><strong>Unrated by:</strong> {result.unratedVendors.join(", ")}</p>
          )}
          <a href={result.permalink} target="_blank" rel="noopener noreferrer">
            Detailed Report
          </a>

          {/* Pie Chart */}
          <div className="chart-container">
            <h3>Security Detection Breakdown</h3>
            <Pie data={getChartData()} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default URLChecker;

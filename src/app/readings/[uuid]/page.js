"use client";

import "../../../App.css";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TarotSummary from "../../../components/TarotSummary";

export default function ReadingPage() {
  const [readingData, setReadingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { uuid } = params;

  useEffect(() => {
    async function fetchReading() {
      try {
        setLoading(true);
        const response = await fetch(`/api/fetchReading?uuid=${uuid}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch reading");
        }

        const data = await response.json();
        setReadingData(data);
      } catch (err) {
        console.error("Error fetching reading:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (uuid) {
      fetchReading();
    }
  }, [uuid]);

  if (loading) {
    return <div className="summary-loading">Loading reading...</div>;
  }

  if (error) {
    return <div className="summary-error">Error: {error}</div>;
  }

  // Use the TarotSummary component to render the reading
  return (
    <div className="reading-container">
      <TarotSummary data={readingData} />
    </div>
  );
}

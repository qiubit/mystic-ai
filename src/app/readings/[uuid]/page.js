'use client';

import '../../../App.css';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReadingPage() {
  const [html, setHtml] = useState('');
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
          throw new Error(errorData.error || 'Failed to fetch reading');
        }

        const data = await response.json();
        setHtml(data.html);
      } catch (err) {
        console.error('Error fetching reading:', err);
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
    return <div className="loading">Loading reading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Render the HTML content directly
  return (
    <div
      className="reading-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

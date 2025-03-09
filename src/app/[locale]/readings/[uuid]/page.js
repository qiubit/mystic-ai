"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import TarotSummary from "../../../../components/TarotSummary";

export default function ReadingPage() {
  const t = useTranslations('readingPage');

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
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        {t('error', {message: error})}
      </div>
    );
  }

  // Use the TarotSummary component to render the reading
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans flex justify-center items-center py-8 px-4">
      <TarotSummary data={readingData} />
    </div>
  );
}

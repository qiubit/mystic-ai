import { useChat } from '@ai-sdk/react';
import { useTranslations } from 'next-intl';

// API endpoint will now be our own server endpoint
const API_URL = "/api/tarotReading";

// No API key stored on client
export const isApiKeySet = () => {
  // Always return true since we'll handle this server-side
  return true;
};

// Keep this function for backward compatibility, but it won't actually do anything
export const setApiKey = () => {
  // No-op function for backward compatibility
  return true;
};

// Save a tarot reading HTML to blob storage
export const saveReadingToBlob = async (html) => {
  try {
    const response = await fetch('/api/tarotShare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      throw new Error('Failed to save reading');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error saving reading:', error);
    throw error;
  }
};

// Fetch a reading by UUID
export const fetchReadingByUuid = async (uuid) => {
  try {
    const response = await fetch(`/api/fetchReading?uuid=${uuid}`);

    if (!response.ok) {
      throw new Error('Failed to fetch reading');
    }

    const data = await response.json();
    return data.html;
  } catch (error) {
    console.error('Error fetching reading:', error);
    throw error;
  }
};

export function useTarotReading(onFinish) {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
  } = useChat({
    api: '/api/tarotReading',
    onFinish
  });

  const t = useTranslations('api');

  const generateReading = async (cards, spreadType, query) => {
    // Format cards into a readable format for the prompt
    const formattedCards = cards
      .map((card) => `${card.name} (${card.uprightMeaning})`)
      .join(", ");

    // Clear previous messages
    setMessages([]);

    // Submit the reading request
    const response = await handleSubmit(null,
      {
        body: {
          cards: formattedCards,
          spreadType,
          query,
        },
        allowEmptySubmit: true,
      },
    );

    return response;
  };

  return {
    reading: messages[messages.length - 1]?.content || t('waitingForCards'),
    generateReading,
    error,
    status,
  };
}

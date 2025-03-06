import { useChat } from '@ai-sdk/react';

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
    reading: messages[messages.length - 1]?.content || 'Looking into the cards...',
    generateReading,
    error,
    status,
  };
}

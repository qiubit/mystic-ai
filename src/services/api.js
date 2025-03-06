import axios from "axios";

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

export const generateTarotReading = async (cards, spreadType, query) => {
  try {
    // Format cards into a readable format for the prompt
    const formattedCards = cards
      .map((card) => `${card.name} (${card.uprightMeaning})`)
      .join(", ");

    // Call our server API endpoint instead of directly calling together.ai
    const response = await axios.post(API_URL, {
      cards: formattedCards,
      spreadType,
      query
    });

    return response.data.reading;
  } catch (error) {
    console.error("Error generating tarot reading:", error);
    return "I am unable to consult the cards at this moment. The spiritual connection is unclear.";
  }
};

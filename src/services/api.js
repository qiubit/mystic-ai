import axios from "axios";

// API endpoint will now be our own server endpoint
const API_URL = "/api/tarot-reading";

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

// For streaming reading generation
export const generateTarotReadingStream = async (cards, spreadType, query, onChunk, onComplete, onError) => {
  try {
    // Format cards into a readable format for the prompt
    const formattedCards = cards
      .map((card) => `${card.name} (${card.uprightMeaning})`)
      .join(", ");

    // Create EventSource for SSE connection
    const eventSource = new EventSource(`${API_URL}?_=${Date.now()}`);
    
    // Start the POST request to initiate the streaming
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cards: formattedCards,
        spreadType,
        query
      })
    }).catch(err => {
      eventSource.close();
      onError(err.message);
    });

    // Listen for messages from server
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if it's an error
        if (data.error) {
          eventSource.close();
          onError(data.message || data.error);
          return;
        }
        
        // Handle stream chunks
        if (data.chunk) {
          onChunk(data.chunk);
        }
        
        // Handle final formatted reading
        if (data.done) {
          if (data.formattedReading) {
            onComplete(data.formattedReading);
          }
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing event data:", err);
        eventSource.close();
        onError("Error processing server response");
      }
    };

    // Handle connection errors
    eventSource.onerror = () => {
      eventSource.close();
      onError("Connection to server lost");
    };
    
    // Return a function to close the connection
    return () => {
      eventSource.close();
    };
  } catch (error) {
    console.error("Error generating tarot reading:", error);
    onError("I am unable to consult the cards at this moment. The spiritual connection is unclear.");
  }
};

// Keep the original function for backward compatibility
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

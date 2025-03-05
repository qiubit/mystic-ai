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

export const generateTarotReading = async (cards, spreadType, query, onTokenReceived, signal) => {
  try {
    // Format cards into a readable format for the prompt
    const formattedCards = cards
      .map((card) => `${card.name} (${card.uprightMeaning})`)
      .join(", ");

    // Call our server API endpoint with streaming
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cards: formattedCards,
        spreadType,
        query
      }),
      signal // Pass the AbortController signal if provided
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullReading = '';
    
    // Set up timeout protection
    const TIMEOUT_MS = 60000; // 1 minute timeout
    let timeoutId = setTimeout(() => {
      throw new Error("Reading timed out after 1 minute");
    }, TIMEOUT_MS);
    
    try {
      // Handle streaming with EventSource-like format
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Reset timeout on each chunk
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          throw new Error("Reading stalled - no data received for 1 minute");
        }, TIMEOUT_MS);
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE format: "data: {...}\n\n"
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              // Special case for the end marker
              if (line.includes('[DONE]')) {
                return fullReading;
              }
              
              // Parse the JSON
              const data = JSON.parse(line.replace('data: ', ''));
              
              if (data.token) {
                // Accumulate the full reading
                fullReading += data.token;
                
                // Call the callback with the current token
                if (onTokenReceived) {
                  onTokenReceived(data.token, fullReading);
                }
              } else if (data.error) {
                throw new Error(`Stream error: ${data.error}`);
              }
            } catch (e) {
              // If it's a JSON parsing error, just log and continue
              if (e instanceof SyntaxError) {
                console.error('Error parsing SSE message:', e);
                console.log('Problematic line:', line);
              } else {
                // For other errors, rethrow
                throw e;
              }
            }
          }
        }
      }
    } finally {
      // Always clear the timeout
      clearTimeout(timeoutId);
    }
    
    return fullReading;
  } catch (error) {
    console.error("Error generating tarot reading:", error);
    return "I am unable to consult the cards at this moment. The spiritual connection is unclear.";
  }
};

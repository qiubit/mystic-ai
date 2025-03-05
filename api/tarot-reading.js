// Using require instead of import for better compatibility with Vercel serverless functions
const fetch = require("node-fetch");
const { PassThrough } = require("stream");

// Together.ai API service for Llama-3.3-70B-Instruct-Turbo
const TOGETHER_API_URL = "https://api.together.xyz/v1/completions";

// Using module.exports instead of export default for better compatibility with Vercel
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get API key from environment variable
    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

    // Log server environment for debugging
    console.log("Node version:", process.version);
    console.log("API key configured:", TOGETHER_API_KEY ? "Yes" : "No");
    console.log(
      "Available environment variables:",
      Object.keys(process.env).filter(
        (key) => !key.includes("KEY") && !key.includes("SECRET")
      )
    );

    if (!TOGETHER_API_KEY) {
      return res
        .status(500)
        .json({ error: "API key not configured on server" });
    }

    const { cards, spreadType, query } = req.body;

    // Create a detailed prompt based on spread type
    let prompt = "";
    if (spreadType === "single") {
      prompt = `You are a mystical tarot reader providing insights based on tarot cards.
User query: "${query}"
Card drawn: ${cards}
Please provide a detailed and insightful tarot reading based on this single card. The reading should have a mystical tone, relate directly to the query, and provide guidance.`;
    } else if (spreadType === "two-card") {
      prompt = `You are a mystical tarot reader providing insights based on tarot cards.
User query: "${query}"
Cards drawn: ${cards}
Please provide a detailed and insightful tarot reading based on these two cards. The first card represents the current situation, and the second represents potential outcomes. The reading should have a mystical tone, relate directly to the query, and provide guidance.`;
    } else if (spreadType === "three-card") {
      prompt = `You are a mystical tarot reader providing insights based on tarot cards.
User query: "${query}"
Cards drawn: ${cards}
Please provide a detailed and insightful tarot reading based on these three cards. The first card represents the past, the second represents the present, and the third represents the future. The reading should have a mystical tone, relate directly to the query, and provide guidance.`;
    }

    // Set headers for server-sent events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    // Make the request to Together.ai with streaming enabled
    const togetherResponse = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        prompt: prompt,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        stop: ["</s>", "User:", "Assistant:"],
        stream: true, // Enable streaming
      }),
    });

    // Check if the response is ok
    if (!togetherResponse.ok) {
      const errorData = await togetherResponse.json();
      console.error("Together API error:", errorData);
      return res.status(togetherResponse.status).json({
        error: "API request failed",
        details: errorData,
      });
    }

    console.log("Query: ", query);
    console.log("Streaming response initiated");

    // Create a pass-through stream to handle streaming response
    const stream = new PassThrough();

    // Process the stream from Together.ai - compatible with both node-fetch v2 and Vercel environment
    let reader;
    if (togetherResponse.body && typeof togetherResponse.body.getReader === 'function') {
      // Modern environments with standard ReadableStream
      reader = togetherResponse.body.getReader();
    } else {
      // Handle case where getReader is not available
      console.log("Streaming not available in this environment, falling back to manual buffer processing");
      
      // Send an initial message to the client
      res.write(`data: ${JSON.stringify({ token: "The cards are being consulted..." })}\n\n`);
      
      // Process the entire response as text
      const fullResponse = await togetherResponse.text();
      
      try {
        // Try to parse the response as JSON if it's not in SSE format
        const jsonResponse = JSON.parse(fullResponse);
        
        if (jsonResponse.choices && jsonResponse.choices[0] && jsonResponse.choices[0].text) {
          const text = jsonResponse.choices[0].text;
          // Send the full text in smaller chunks to simulate streaming
          const chunkSize = 5;
          for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.slice(i, i + chunkSize);
            res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      } catch (e) {
        // If it's not valid JSON, it might be SSE format already
        const lines = fullResponse.split("\n\n");
        for (const line of lines) {
          if (line.trim() && line.startsWith("data: ")) {
            res.write(`${line}\n\n`);
          }
        }
      }
      
      // End the response
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }
    
    const decoder = new TextDecoder();
    
    // Set up timeout protection
    const TIMEOUT_MS = 120000; // 2 minutes timeout
    let timeoutId = setTimeout(() => {
      console.error("Stream processing timeout");
      res.write(`data: ${JSON.stringify({ error: "Stream processing timeout after 2 minutes" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }, TIMEOUT_MS);
    
    // Track if response has ended to prevent double-ending
    let hasEnded = false;
    
    // Function to safely end the response
    const safeEndResponse = (message = null) => {
      if (hasEnded) return;
      
      clearTimeout(timeoutId);
      if (message) {
        res.write(`data: ${JSON.stringify({ token: message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      hasEnded = true;
    };
    
    // Handle client disconnect
    req.on('close', () => {
      console.log("Client disconnected");
      clearTimeout(timeoutId);
      hasEnded = true; // Mark as ended so we don't try to write to it
    });
    
    async function processStream() {
      try {
        // Only run this if reader exists (was created in the condition above)
        if (reader) {
          while (!hasEnded) {
            const { done, value } = await reader.read();
            if (done) {
              safeEndResponse();
              break;
            }
  
            // Reset timeout on each chunk
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              console.error("Stream processing timeout");
              safeEndResponse("\n\n[The mystical connection has faded. The reading is incomplete.]");
            }, TIMEOUT_MS);

            // Decode the chunk and parse the SSE format from Together.ai
            const chunk = decoder.decode(value, { stream: true });
            
            // Together.ai returns data in the format "data: {...}\n\n"
            const lines = chunk.split("\n\n");
            for (const line of lines) {
              if (hasEnded) break; // Check if we've already ended
              
              if (line.trim() && line.startsWith("data: ")) {
                try {
                  // Special case for parsing errors
                  if (line.includes('"error":')) {
                    const errorData = JSON.parse(line.replace("data: ", ""));
                    console.error("Together.ai stream error:", errorData);
                    safeEndResponse("\n\n[The cards have become unclear. We must end this reading.]");
                    break;
                  }
                  
                  const jsonData = JSON.parse(line.replace("data: ", ""));
                  
                  // Extract the token from the response
                  if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].text) {
                    const token = jsonData.choices[0].text;
                    
                    // Send token to client
                    if (!hasEnded) {
                      res.write(`data: ${JSON.stringify({ token })}\n\n`);
                    }
                  }
                } catch (e) {
                  // Log and continue on malformed JSON
                  console.error("Error parsing SSE chunk:", e, "Raw data:", line);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Stream processing error:", error);
        safeEndResponse("\n\n[A disturbance in the mystical energies has occurred. The reading cannot continue.]");
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Start processing the stream
    processStream().catch(error => {
      console.error("Unhandled error in stream processing:", error);
      safeEndResponse();
    });

  } catch (error) {
    console.error("Error generating tarot reading:", error);
    // Log full error details including stack trace
    console.error(error.stack);

    return res.status(500).json({
      error: "Failed to generate reading",
      message: error.message,
      stack: error.stack,
    });
  }
};

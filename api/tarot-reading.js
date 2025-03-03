// Using require instead of import for better compatibility with Vercel serverless functions
const axios = require("axios");

// Together.ai API service for Llama-3.3-70B-Instruct-Turbo
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

/**
 * Formats the raw reading text to make it more readable
 * Adds proper paragraphs, spacing, and formatting
 */
function formatReadingText(text) {
  if (!text) return "";

  // Split into paragraphs (by single or multiple newlines)
  let paragraphs = text.split(/\n+/);

  // Process each paragraph
  paragraphs = paragraphs.map((paragraph) => {
    // Remove extra spaces and trim
    paragraph = paragraph.trim().replace(/\s+/g, " ");

    // Ensure proper capitalization for first letter of paragraph
    if (paragraph.length > 0) {
      paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
    }

    return paragraph;
  });

  // Filter out empty paragraphs
  paragraphs = paragraphs.filter((p) => p.length > 0);

  // Structure the reading for better readability
  // First paragraph as introduction
  let formattedReading = paragraphs[0] + "\n\n";

  // Middle paragraphs with bullet points for easier scanning
  if (paragraphs.length > 2) {
    for (let i = 1; i < paragraphs.length - 1; i++) {
      // Add bullet points to middle paragraphs for easier reading
      formattedReading += "• " + paragraphs[i] + "\n\n";
    }
  }

  // Last paragraph as conclusion if there are at least 3 paragraphs
  if (paragraphs.length >= 3) {
    formattedReading += paragraphs[paragraphs.length - 1];
  } else if (paragraphs.length === 2) {
    // If only 2 paragraphs, add the second one without bullet
    formattedReading += paragraphs[1];
  }

  return formattedReading;
}

// Using module.exports instead of export default for better compatibility with Vercel
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

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
      res.write(`data: ${JSON.stringify({ error: "API key not configured on server" })}\n\n`);
      return res.end();
    }

    const { cards, spreadType, query } = req.body;

    // Create a detailed system message based on spread type
    let systemMessage = "You are a mystical tarot reader providing insights based on tarot cards. Your readings have a mystical tone, relate directly to the query, and provide thoughtful guidance.";
    
    // Create user message based on spread type
    let userMessage = "";
    if (spreadType === "single") {
      userMessage = `User query: "${query}"
Card drawn: ${cards}
Please provide a detailed and insightful tarot reading based on this single card.`;
    } else if (spreadType === "two-card") {
      userMessage = `User query: "${query}"
Cards drawn: ${cards}
Please provide a detailed and insightful tarot reading based on these two cards. The first card represents the current situation, and the second represents potential outcomes.`;
    } else if (spreadType === "three-card") {
      userMessage = `User query: "${query}"
Cards drawn: ${cards}
Please provide a detailed and insightful tarot reading based on these three cards. The first card represents the past, the second represents the present, and the third represents the future.`;
    }

    // Send initial message to client
    res.write(`data: ${JSON.stringify({ chunk: '', done: false })}\n\n`);

    // Call Together.ai API with streaming enabled
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        stream: true
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: 'stream'
      }
    );

    let fullResponse = '';

    // Process the streaming response
    response.data.on('data', (chunk) => {
      const text = chunk.toString();
      
      // Together.ai sends data in the format "data: {...}\n\n"
      const dataStrings = text.split('\n\n').filter(Boolean);
      
      for (const dataString of dataStrings) {
        if (dataString.startsWith('data: ')) {
          try {
            const jsonStr = dataString.slice(6); // Remove "data: " prefix
            if (jsonStr === '[DONE]') continue;
            
            const json = JSON.parse(jsonStr);
            const content = json.choices[0]?.delta?.content || '';
            
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ chunk: content, done: false })}\n\n`);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    });

    // Handle the end of the stream
    response.data.on('end', () => {
      // Format the full response
      const formattedReading = formatReadingText(fullResponse);
      
      console.log("Query: ", query);
      console.log("AI Response: ", formattedReading);
      
      // Send final formatted response
      res.write(`data: ${JSON.stringify({ chunk: '', formattedReading, done: true })}\n\n`);
      res.end();
    });

    // Handle errors in the stream
    response.data.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: "Stream error", message: err.message, done: true })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error("Error generating tarot reading:", error);
    // Log full error details including stack trace
    console.error(error.stack);

    res.write(`data: ${JSON.stringify({
      error: "Failed to generate reading",
      message: error.message,
      done: true
    })}\n\n`);
    res.end();
  }
};

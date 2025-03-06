// Using require instead of import for better compatibility with Vercel serverless functions
const axios = require("axios");

// Together.ai API service for Llama-3.3-70B-Instruct-Turbo
const TOGETHER_API_URL = "https://api.together.xyz/v1/completions";

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

// Replace module.exports with a named export for POST
export async function POST(req) {
  try {
    // Get API key from environment variable
    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

    // Get the request body
    const body = await req.json(); // Changed from req.body to req.json()
    const { cards, spreadType, query } = body;

    return Response.json({ reading: "hello, world" });

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
      return Response.json( // Changed from res.status().json()
        { error: "API key not configured on server" },
        { status: 500 }
      );
    }

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

    // Call Together.ai API with Llama-3.3-70B-Instruct-Turbo
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        prompt: prompt,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        stop: ["</s>", "User:", "Assistant:"],
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Get the raw reading text
    const rawReading = response.data.choices[0].text.trim();

    // Format the reading with paragraphs and line breaks for easier reading
    const formattedReading = formatReadingText(rawReading);

    console.log("Query: ", query);
    console.log("AI Response: ", formattedReading);

    // Return the formatted reading to the client
    return Response.json({ reading: formattedReading }); // Changed from res.status().json()
  } catch (error) {
    console.error("Error generating tarot reading:", error);
    console.error(error.stack);

    return Response.json( // Changed from res.status().json()
      {
        error: "Failed to generate reading",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

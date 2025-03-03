// Using require instead of import for better compatibility with Vercel serverless functions
const axios = require('axios');

// Together.ai API service for Llama-3.3-70B-Instruct-Turbo
const TOGETHER_API_URL = 'https://api.together.xyz/v1/completions';

// Using module.exports instead of export default for better compatibility with Vercel
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable
    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
    
    // Log server environment for debugging
    console.log('Node version:', process.version);
    console.log('API key configured:', TOGETHER_API_KEY ? 'Yes' : 'No');
    console.log('Available environment variables:', Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET')));
    
    if (!TOGETHER_API_KEY) {
      return res.status(500).json({ error: 'API key not configured on server' });
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

    // Return the reading to the client
    return res.status(200).json({ reading: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error generating tarot reading:', error);
    // Log full error details including stack trace
    console.error(error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to generate reading',
      message: error.message,
      stack: error.stack
    });
  }
}
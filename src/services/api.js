import axios from "axios";

// Together.ai API service for Llama-3.3-70B-Instruct-Turbo
const TOGETHER_API_URL = "https://api.together.xyz/v1/completions";

// Try to get API key from environment variable, otherwise will need to be set via UI
let TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "";

export const setApiKey = (key) => {
  TOGETHER_API_KEY = key;
};

export const isApiKeySet = () => {
  return TOGETHER_API_KEY != null && TOGETHER_API_KEY.length > 0;
};

export const generateTarotReading = async (cards, spreadType, query) => {
  if (!TOGETHER_API_KEY) {
    throw new Error("Together API key is not set");
  }

  try {
    // Format cards into a readable format for the prompt
    const formattedCards = cards
      .map((card) => `${card.name} (${card.uprightMeaning})`)
      .join(", ");

    // Create a detailed prompt based on spread type
    let prompt = "";
    if (spreadType === "single") {
      prompt = `You are a mystical tarot reader providing insights based on tarot cards.
User query: "${query}"
Card drawn: ${formattedCards}
Please provide a detailed and insightful tarot reading based on this single card. The reading should have a mystical tone, relate directly to the query, and provide guidance.`;
    } else if (spreadType === "two-card") {
      prompt = `You are a mystical tarot reader providing insights based on tarot cards.
User query: "${query}"
Cards drawn: ${formattedCards}
Please provide a detailed and insightful tarot reading based on these two cards. The first card represents the current situation, and the second represents potential outcomes. The reading should have a mystical tone, relate directly to the query, and provide guidance.`;
    } else if (spreadType === "three-card") {
      prompt = `You are a mystical tarot reader providing insights based on tarot cards.
User query: "${query}"
Cards drawn: ${formattedCards}
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

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating tarot reading:", error);
    return "I am unable to consult the cards at this moment. The spiritual connection is unclear.";
  }
};

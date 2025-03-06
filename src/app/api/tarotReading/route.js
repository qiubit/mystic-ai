import { togetherai } from "@ai-sdk/togetherai";
import { createDataStreamResponse, smoothStream, streamText } from "ai";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
    const body = await req.json();
    const { cards, spreadType, query } = body;

    if (!TOGETHER_AI_API_KEY) {
      return Response.json(
        { error: "API key not configured on server" },
        { status: 500 }
      );
    }

    // Create the same prompt based on spread type
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
Please provide a detailed and insightful tarot reading based on these three cards. The first card represents the past, the second represents the present, and the third represents the future. The reading should have a mystical tone, relate directly to the query, and provide guidance. Keep the reading concise and to the point. Use emojis in the reading for more mystic vibe.`;
    }

    // Create the stream
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: togetherai("meta-llama/Llama-3.3-70B-Instruct-Turbo"),
          system: prompt,
          messages: [],
          // experimental_activeTools:
          //   selectedChatModel === 'chat-model-reasoning'
          //     ? []
          //     : [
          //         'getWeather',
          //         'createDocument',
          //         'updateDocument',
          //         'requestSuggestions',
          //       ],
          experimental_transform: smoothStream({ chunking: "word" }),
          // tools: {
          //   getWeather,
          //   createDocument: createDocument({ session, dataStream }),
          //   updateDocument: updateDocument({ session, dataStream }),
          //   requestSuggestions: requestSuggestions({
          //     session,
          //     dataStream,
          //   }),
          // },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        console.error(error);
        return "Oops, an error occured!";
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}

import { togetherai } from "@ai-sdk/togetherai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
    const body = await req.json();
    const { reading } = body;

    if (!TOGETHER_AI_API_KEY) {
      return Response.json(
        { error: "API key not configured on server" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are tarot reading summariser. Your task is to summarise the reading of the all card drawn; and finish up with total reading summary, using in 1-3 sentences per card and total reading summary. Each summary should be in separate paragraph, there should be 4 paragraphs total. For cards, the first line of paragraph should contain emoji and title and second; the reading. For total summary, it should be surrounded by emojis from both sides.

Example Input:
In the realm of the past, The Moon suggests that your previous experiences in love have been shrouded in illusion, fear, and anxiety. Your subconscious may have been clouded by doubts and uncertainties, leading to a sense of disconnection from your true desires. This card indicates that you may have been navigating through the darkness, unsure of the path ahead.

As we transition to the present, Justice reveals that the universe is currently balancing the scales of truth and fairness in your love life. This card signifies that you are being called to confront the realities of your past experiences and acknowledge the cause and effect of your actions. It is a time for self-reflection, honesty, and accountability, allowing you to clarify your intentions and prepare for the future.

Now, as we gaze into the future, The Tower bursts forth with a revelation that will shake the foundations of your love life. This card foretells a sudden and profound change, one that may seem catastrophic at first, but ultimately leads to a liberation from the old and a rebirth into the new. Expect a dramatic upheaval that will clear the way for a more authentic and profound connection with yourself and others. The Tower suggests that you are on the cusp of a revolutionary transformation, one that will awaken you to the true nature of love and relationships.


Example Output:
🔮 Past – The Moon
Your love life has been clouded by illusion and uncertainty. Doubts and fears may have kept you from seeing the truth.

⚖️ Present – Justice
The universe is restoring balance. It’s time for honesty, reflection, and taking responsibility for your choices in love.

🔥 Future – The Tower
A sudden shake-up is coming! Though it may feel chaotic, this transformation will clear the way for deeper, more authentic connections.

🌿 Trust the process. Embrace the truth. Love is evolving. 💫✨
 `;

    const { text } = await generateText({
      model: togetherai("meta-llama/Llama-3.3-70B-Instruct-Turbo"),
      system: systemPrompt,
      prompt: reading,
    });

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}

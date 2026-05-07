import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: "You are HeatGuard AI, an expert workplace heat safety assistant for HSE managers in the UAE. Keep your answers concise, professional, and focused on worker safety, hydration, and WBGT monitoring. Do not hallucinate database records.",
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI Route Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process AI request" }), { status: 500 });
  }
}
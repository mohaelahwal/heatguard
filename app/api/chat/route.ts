import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      system: "You are HeatGuard AI, an expert workplace heat safety assistant for HSE managers in the UAE. Keep your answers concise, professional, and focused on worker safety, hydration, and WBGT monitoring.",
      messages: messages,
    });

    // The golden key: using the legacy function name to match your package!
    return result.toAIStreamResponse();

  } catch (error) {
    console.error("AI API Error:", error);
    return new Response("Failed to fetch AI", { status: 500 });
  }
}
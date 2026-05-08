import { google } from '@ai-sdk/google'
import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = await streamText({
    model: google('gemini-1.5-flash-latest'),
    system:
      'You are HeatGuard AI, an expert workplace heat safety assistant for HSE managers in the UAE. Keep your answers concise, professional, and focused on worker safety, hydration, and WBGT monitoring.',
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}

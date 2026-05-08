import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: 'You are HeatGuard AI, an expert workplace heat safety assistant for HSE managers in the UAE. Keep your answers concise, professional, and focused on worker safety, hydration, and WBGT monitoring.',
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('AI API Error:', error)
    return new Response('Failed to generate AI response', { status: 500 })
  }
}

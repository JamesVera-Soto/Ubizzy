import { streamText } from "../../../node_modules/ai"
import { openai } from "../../../node_modules/@ai-sdk/openai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: `You are Ubizy Assistant, a helpful AI assistant for a productivity and task management app.
          Your goal is to help users manage their tasks, events, and habits effectively.
          Provide concise, helpful responses focused on productivity, time management, and organization.
          When users ask about creating tasks, events, or habits, try to extract relevant details like title, date, time, and category.
          Be friendly and encouraging, but keep responses brief and to the point.`,
    messages,
  })

  return result.toDataStreamResponse()
}


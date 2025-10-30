import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const frames: string[] = []

    // Extract all frames from FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("frame_")) {
        frames.push(value as string)
      }
    }

    if (frames.length === 0) {
      return new Response(JSON.stringify({ error: "No frames provided" }), { status: 400 })
    }

    const prompt = `You are an expert lip-reading AI. Analyze the following video frames showing a person's mouth/lips and predict what text they are speaking.

Important guidelines:
1. Focus on the mouth and lip movements
2. Look for patterns in lip shapes and movements
3. Consider common words and phrases
4. Be confident but acknowledge uncertainty if needed
5. Provide the predicted text as the main output

Frames provided: ${frames.length} frames extracted from the video.

Based on the lip movements in these frames, predict the spoken text. Provide:
1. The predicted text/speech
2. Confidence level (high/medium/low)
3. Any alternative interpretations if applicable

Please analyze the lip movements and provide your prediction.`

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            // Include first frame as visual reference
            {
              type: "image",
              image: frames[0],
            },
          ],
        },
      ],
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error in lip-reader API:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process video",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    )
  }
}

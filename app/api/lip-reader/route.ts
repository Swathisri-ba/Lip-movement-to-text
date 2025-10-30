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

    const demoResponses = [
      "Hello, how are you today?",
      "Thank you for watching this video.",
      "The weather is beautiful today.",
      "I love learning new things.",
      "Have a great day ahead!",
      "Welcome to the lip reading demo.",
    ]

    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)]

    // Create a readable stream that simulates streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send initial message
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "text-delta",
              text: randomResponse,
            }) + "\n",
          ),
        )

        // Send confidence level
        setTimeout(() => {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "text-delta",
                text: "\n\n**Confidence Level:** High (92%)",
              }) + "\n",
            ),
          )
        }, 500)

        // Send alternative interpretation
        setTimeout(() => {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "text-delta",
                text: "\n\n**Alternative Interpretation:** Similar lip patterns could also suggest alternative phrases.",
              }) + "\n",
            ),
          )
        }, 1000)

        // Send completion message
        setTimeout(() => {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "message-stop",
              }) + "\n",
            ),
          )
          controller.close()
        }, 1500)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
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

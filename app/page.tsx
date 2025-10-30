"use client"

import { useState } from "react"
import VideoRecorder from "@/components/video-recorder"
import ResultsDisplay from "@/components/results-display"

export default function Home() {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <p className="text-sm font-medium text-primary">AI-Powered Lip Reading</p>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-balance">Lip Reader</h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Convert lip movements to text using advanced AI and MediaPipe lip detection. Record a video or upload one
              to get started.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Recorder Section */}
            <div className="flex flex-col gap-4">
              <VideoRecorder onVideoCapture={setVideoBlob} isProcessing={isProcessing} />
            </div>

            {/* Results Section */}
            <div className="flex flex-col gap-4">
              <ResultsDisplay videoBlob={videoBlob} onProcessingChange={setIsProcessing} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">How it works</h3>
                <p className="text-sm text-muted-foreground">Record or upload a video of someone speaking</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">Our AI analyzes lip movements and predicts text</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Get Results</h3>
                <p className="text-sm text-muted-foreground">View predictions with confidence levels</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import LipDetectionOverlay from "@/components/lip-detection-overlay"

interface ResultsDisplayProps {
  videoBlob: Blob | null
  onProcessingChange: (isProcessing: boolean) => void
}

export default function ResultsDisplay({ videoBlob, onProcessingChange }: ResultsDisplayProps) {
  const [videoFrames, setVideoFrames] = useState<string[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [showLipDetection, setShowLipDetection] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string>("")

  useEffect(() => {
    onProcessingChange(isLoading || isExtracting)
  }, [isLoading, isExtracting, onProcessingChange])

  const extractFrames = async (blob: Blob) => {
    setIsExtracting(true)
    setError(null)
    try {
      const video = document.createElement("video")
      video.src = URL.createObjectURL(blob)

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        setError("Failed to initialize canvas")
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const frames: string[] = []
      const frameInterval = Math.max(1, Math.floor(video.duration / 5)) // Extract 5 frames

      for (let i = 0; i < video.duration; i += frameInterval) {
        video.currentTime = i
        await new Promise((resolve) => {
          video.onseeked = resolve
        })

        ctx.drawImage(video, 0, 0)
        frames.push(canvas.toDataURL("image/jpeg", 0.7))
      }

      setVideoFrames(frames)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to extract frames"
      setError(message)
      console.error("Error extracting frames:", error)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleConvertToText = async () => {
    if (!videoBlob || videoFrames.length === 0) {
      setError("Please record or upload a video first")
      return
    }

    setError(null)
    setIsLoading(true)
    setResults("")

    const formData = new FormData()
    videoFrames.forEach((frame, index) => {
      formData.append(`frame_${index}`, frame)
    })

    try {
      const response = await fetch("/api/lip-reader", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process video")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line)
              if (parsed.type === "text-delta") {
                setResults((prev) => prev + parsed.text)
              }
            } catch {
              // Skip parsing errors
            }
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error processing video"
      setError(message)
      console.error("Error processing video:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (videoBlob) {
      extractFrames(videoBlob)
    }
  }, [videoBlob])

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Predicted Text</h2>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {videoBlob && (
          <div className="space-y-2">
            <button
              onClick={() => setShowLipDetection(!showLipDetection)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showLipDetection ? "Hide" : "Show"} Lip Detection
            </button>
            {showLipDetection && <LipDetectionOverlay videoBlob={videoBlob} isActive={showLipDetection} />}
          </div>
        )}

        <div className="min-h-32 bg-muted/50 rounded-lg p-4 border border-border">
          {results ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-accent/10 text-accent-foreground">
                <p className="text-sm font-medium mb-1">AI Analysis</p>
                <p className="text-sm whitespace-pre-wrap">{results}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Results will appear here after processing</p>
          )}
        </div>

        {videoFrames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Extracted {videoFrames.length} frames</p>
            <div className="grid grid-cols-5 gap-2">
              {videoFrames.map((frame, index) => (
                <img
                  key={index}
                  src={frame || "/placeholder.svg"}
                  alt={`Frame ${index}`}
                  className="w-full h-auto rounded border border-border"
                />
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleConvertToText}
          disabled={!videoBlob || isLoading || isExtracting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading || isExtracting ? (
            <div className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              Processing...
            </div>
          ) : (
            "Convert to Text"
          )}
        </Button>

        {isExtracting && <p className="text-sm text-muted-foreground text-center">Extracting frames from video...</p>}
      </div>
    </Card>
  )
}

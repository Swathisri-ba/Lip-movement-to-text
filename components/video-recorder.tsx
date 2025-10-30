"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface VideoRecorderProps {
  onVideoCapture: (blob: Blob) => void
  isProcessing: boolean
}

export default function VideoRecorder({ onVideoCapture, isProcessing }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to access camera"
      setError(message)
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return

    chunksRef.current = []
    const stream = videoRef.current.srcObject as MediaStream
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    })

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      setRecordedVideo(url)
      onVideoCapture(blob)
    }

    mediaRecorderRef.current.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB")
        return
      }
      const url = URL.createObjectURL(file)
      setRecordedVideo(url)
      onVideoCapture(file)
      stopCamera()
      setError(null)
    }
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Video Input</h2>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {!recordedVideo ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <video src={recordedVideo} controls className="w-full h-full object-cover" />
          )}
        </div>

        {/* Canvas for lip detection preview (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="space-y-3">
          {!cameraActive && !recordedVideo && (
            <Button
              onClick={startCamera}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isProcessing}
            >
              Start Camera
            </Button>
          )}

          {cameraActive && !recordedVideo && (
            <>
              <div className="flex gap-2">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 ${
                    isRecording
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  disabled={isProcessing}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 bg-transparent"
                  disabled={isProcessing}
                >
                  Close Camera
                </Button>
              </div>
            </>
          )}

          {recordedVideo && (
            <Button
              onClick={() => {
                setRecordedVideo(null)
                onVideoCapture(null as any)
                startCamera()
              }}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              Record New Video
            </Button>
          )}

          {/* File Upload */}
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="video-upload"
              disabled={isProcessing}
            />
            <label htmlFor="video-upload">
              <Button
                asChild
                variant="outline"
                className="w-full cursor-pointer bg-transparent"
                disabled={isProcessing}
              >
                <span>Upload Video</span>
              </Button>
            </label>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm">Recording...</span>
          </div>
        )}
      </div>
    </Card>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface LipDetectionOverlayProps {
  videoBlob: Blob | null
  isActive: boolean
}

export default function LipDetectionOverlay({ videoBlob, isActive }: LipDetectionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lipPoints, setLipPoints] = useState<Array<{ x: number; y: number }>>([])

  // Load MediaPipe Face Mesh
  useEffect(() => {
    const loadMediaPipe = async () => {
      if (!isActive || !videoBlob) return

      setIsLoading(true)
      try {
        // Dynamically import MediaPipe
        const { FaceMesh } = await import("@mediapipe/face_mesh")
        const { Camera } = await import("@mediapipe/camera_utils")
        const { drawConnectors, drawLandmarks } = await import("@mediapipe/drawing_utils")

        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) return

        // Create video element from blob
        const url = URL.createObjectURL(videoBlob)
        video.src = url
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          const faceMesh = new FaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          })

          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          })

          const ctx = canvas.getContext("2d")
          if (!ctx) return

          // Lip landmarks indices in MediaPipe Face Mesh
          const lipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]

          faceMesh.onResults((results: any) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const landmarks = results.multiFaceLandmarks[0]

              // Draw lip region
              ctx.strokeStyle = "#FF6B6B"
              ctx.lineWidth = 2
              ctx.fillStyle = "rgba(255, 107, 107, 0.1)"

              // Draw lip contour
              ctx.beginPath()
              lipIndices.forEach((index, i) => {
                const landmark = landmarks[index]
                const x = landmark.x * canvas.width
                const y = landmark.y * canvas.height

                if (i === 0) {
                  ctx.moveTo(x, y)
                } else {
                  ctx.lineTo(x, y)
                }
              })
              ctx.closePath()
              ctx.fill()
              ctx.stroke()

              // Draw individual lip points
              ctx.fillStyle = "#FF6B6B"
              lipIndices.forEach((index) => {
                const landmark = landmarks[index]
                const x = landmark.x * canvas.width
                const y = landmark.y * canvas.height
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, 2 * Math.PI)
                ctx.fill()
              })

              // Store lip points for analysis
              const points = lipIndices.map((index) => {
                const landmark = landmarks[index]
                return {
                  x: landmark.x * canvas.width,
                  y: landmark.y * canvas.height,
                }
              })
              setLipPoints(points)
            }

            if (video.currentTime < video.duration) {
              animationFrameRef.current = requestAnimationFrame(() => {
                faceMesh.send({ image: video })
              })
            }
          })

          // Start processing
          faceMesh.send({ image: video })
        }

        video.play()
      } catch (error) {
        console.error("Error loading MediaPipe:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMediaPipe()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [videoBlob, isActive])

  if (!isActive || !videoBlob) return null

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Lip Detection Preview</h3>

        {isLoading && <p className="text-xs text-muted-foreground">Loading MediaPipe...</p>}

        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <canvas ref={canvasRef} className="w-full h-full" />
          <video ref={videoRef} className="hidden" />
        </div>

        {lipPoints.length > 0 && (
          <p className="text-xs text-muted-foreground">Detected {lipPoints.length} lip landmarks</p>
        )}
      </div>
    </Card>
  )
}

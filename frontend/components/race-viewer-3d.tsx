"use client"

import { useRef, useEffect } from "react"

export default function RaceViewer3D() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.02

      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#1f2937")
      gradient.addColorStop(1, "#111827")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw track outline
      ctx.strokeStyle = "#dc2626"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, 120, 80, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw inner track
      ctx.strokeStyle = "rgba(220, 38, 38, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, 100, 65, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw racing cars
      const cars = [
        { angle: time * 0.02, x: 1, y: 0.2, color: "#dc2626", label: "P1" },
        { angle: time * 0.018 + 0.5, x: 1, y: 0.2, color: "#f59e0b", label: "P2" },
        { angle: time * 0.016 + 1, x: 1, y: 0.2, color: "#c0c0c0", label: "P3" },
      ]

      cars.forEach((car) => {
        const x = canvas.width / 2 + Math.cos(car.angle) * 120
        const y = canvas.height / 2 + Math.sin(car.angle) * 80

        // Car body
        ctx.fillStyle = car.color
        ctx.fillRect(x - 6, y - 4, 12, 8)

        // Car outline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 1
        ctx.strokeRect(x - 6, y - 4, 12, 8)

        // Position label
        ctx.fillStyle = "white"
        ctx.font = "bold 10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(car.label, x, y - 10)
      })

      // Draw finish line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 20, canvas.height / 2 - 85)
      ctx.lineTo(canvas.width / 2 + 20, canvas.height / 2 - 85)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw lap timer
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(10, 10, 100, 40)
      ctx.fillStyle = "#f59e0b"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "left"
      ctx.fillText("LAP 32/50", 15, 28)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "10px Arial"
      ctx.fillText("45m 23s", 15, 42)

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="race-track w-full h-64 border border-red-700/50 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950"
    />
  )
}

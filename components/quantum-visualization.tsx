'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface QuantumVisualizationProps {
  phi?: number
  gamma?: number
  lambda?: number
  w2?: number
  className?: string
}

export function QuantumVisualization({ 
  phi = 0, 
  gamma = 0, 
  lambda = 0, 
  w2 = 0,
  className = '' 
}: QuantumVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#161616'
    ctx.fillRect(0, 0, width, height)

    // Draw quantum state visualization
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 2 - 20

    // Phi - Integrated Information (outer ring)
    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * phi, 0, 2 * Math.PI)
    ctx.strokeStyle = '#78a9ff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Lambda - Quantum Coherence (middle ring)
    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * (lambda / 10), 0, 2 * Math.PI)
    ctx.strokeStyle = '#a56eff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Gamma - Decoherence (particles)
    const particleCount = Math.floor(gamma * 50)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 2 * Math.PI
      const radius = maxRadius * 0.7
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(255, 153, 51, ${0.3 + gamma * 0.7})`
      ctx.fill()
    }

    // W2 - Manifold Stability (center glow)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.3)
    gradient.addColorStop(0, `rgba(52, 211, 153, ${0.8 * (1 - w2)})`)
    gradient.addColorStop(1, 'rgba(52, 211, 153, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw entanglement lines
    const numLines = Math.floor(phi * 8)
    for (let i = 0; i < numLines; i++) {
      const angle1 = (i / numLines) * 2 * Math.PI
      const angle2 = ((i + 3) / numLines) * 2 * Math.PI
      const radius = maxRadius * 0.6
      
      const x1 = centerX + Math.cos(angle1) * radius
      const y1 = centerY + Math.sin(angle1) * radius
      const x2 = centerX + Math.cos(angle2) * radius
      const y2 = centerY + Math.sin(angle2) * radius
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = `rgba(120, 169, 255, ${0.1 + phi * 0.2})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

  }, [phi, gamma, lambda, w2])

  return (
    <Card className={`bg-ibm-gray-100 border-ibm-gray-80 p-4 ${className}`}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-auto rounded"
      />
    </Card>
  )
}

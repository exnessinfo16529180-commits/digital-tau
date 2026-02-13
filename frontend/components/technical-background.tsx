"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Cpu, Code2, Network, Database, ShieldCheck, Binary, Workflow } from "lucide-react"

const icons = [Cpu, Code2, Network, Database, ShieldCheck, Binary, Workflow]

interface Point {
  x: number
  y: number
  iconIndex: number
  delay: number
  size: number
}

export function TechnicalBackground() {
  const [points, setPoints] = useState<Point[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generatePoints = () => {
      const newPoints: Point[] = []
      const count = 15
      for (let i = 0; i < count; i++) {
        newPoints.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          iconIndex: Math.floor(Math.random() * icons.length),
          delay: Math.random() * 5,
          size: 16 + Math.random() * 24
        })
      }
      setPoints(newPoints)
    }

    generatePoints()
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-burgundy-uni/10 blur-[120px] rounded-full" />

      {/* Pulsing Icons */}
      {points.map((point, i) => {
        const Icon = icons[point.iconIndex]
        return (
          <motion.div
            key={i}
            className="absolute text-cyan-500/20"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: point.delay,
              ease: "easeInOut"
            }}
          >
            <Icon size={point.size} strokeWidth={1} />
          </motion.div>
        )
      })}

      {/* Shimmering Lines (Technical Scheme Look) */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <pattern id="lines" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
          <circle cx="0" cy="0" r="2" fill="currentColor" className="text-cyan-400" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#lines)" />
      </svg>
    </div>
  )
}

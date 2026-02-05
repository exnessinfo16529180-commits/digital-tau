"use client"

import { useEffect, useRef } from "react"

const codeSnippets = [
  "const x = 42",
  "function()",
  "return data",
  "import React",
  "async await",
  "useState()",
  "useEffect()",
  "export default",
  "interface Props",
  "type T = {}",
  "=> { }",
  "console.log",
  "fetch(url)",
  "map(item =>",
  "filter(x =>",
  "reduce((a,b)",
  "Promise.all",
  "try { catch",
  "if (true) {",
  "for (let i",
  "while (true)",
  "class App",
  "extends React",
  "this.state",
  "props.data",
  "render() {",
  "componentDid",
  "useCallback",
  "useMemo(() =>",
  "useRef(null)",
  "0x7F3A9B",
  "0b101010",
  "NaN !== NaN",
  "undefined",
  "null ?? ''",
  "?.optional",
  "...spread",
  "<Component />",
  "{children}",
  "key={id}",
]

interface MatrixColumn {
  x: number
  y: number
  speed: number
  chars: string[]
  opacity: number
}

const MATRIX = {
  columnWidth: 46,
  xJitter: 18,
  font: "13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  lineHeight: 20,
  fadeFill: "rgba(10, 10, 16, 0.22)",
  opacityMin: 0.12,
  opacityMax: 0.26,
  shadowBlur: 8,
  canvasBg: "rgba(10, 10, 16, 0.18)",
} as const

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const columnsRef = useRef<MatrixColumn[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initColumns()
    }

    const initColumns = () => {
      const columnCount = Math.floor(canvas.width / MATRIX.columnWidth)
      columnsRef.current = Array.from({ length: columnCount }, (_, i) => ({
        x: i * MATRIX.columnWidth + Math.random() * MATRIX.xJitter,
        y: Math.random() * canvas.height - canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        chars: Array.from(
          { length: 5 + Math.floor(Math.random() * 10) },
          () => codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
        ),
        opacity:
          MATRIX.opacityMin +
          Math.random() * (MATRIX.opacityMax - MATRIX.opacityMin),
      }))
    }

    const animate = () => {
      ctx.fillStyle = MATRIX.fadeFill
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = MATRIX.font
      ctx.textBaseline = "top"

      columnsRef.current.forEach((column) => {
        column.y += column.speed

        column.chars.forEach((char, charIndex) => {
          const y = column.y + charIndex * MATRIX.lineHeight

          if (y > 0 && y < canvas.height) {
            const gradient = ctx.createLinearGradient(0, y - 10, 0, y + 10)
            // Keep the "matrix" in burgundy tones, but brighter for readability.
            gradient.addColorStop(0, `rgba(122, 31, 61, ${column.opacity * 0.9})`)
            gradient.addColorStop(0.55, `rgba(179, 74, 108, ${column.opacity})`)
            gradient.addColorStop(1, `rgba(255, 210, 226, ${column.opacity * 0.55})`)

            ctx.fillStyle = gradient
            ctx.shadowColor = `rgba(179, 74, 108, ${Math.min(0.38, column.opacity)})`
            ctx.shadowBlur = MATRIX.shadowBlur
            ctx.fillText(char, column.x, y)
          }
        })

        if (column.y > canvas.height) {
          column.y = -column.chars.length * MATRIX.lineHeight
          column.chars = Array.from(
            { length: 5 + Math.floor(Math.random() * 10) },
            () => codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
          )
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: MATRIX.canvasBg }}
    />
  )
}

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
      const columnCount = Math.floor(canvas.width / 50)
      columnsRef.current = Array.from({ length: columnCount }, (_, i) => ({
        x: i * 50 + Math.random() * 20,
        y: Math.random() * canvas.height - canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        chars: Array.from(
          { length: 5 + Math.floor(Math.random() * 10) },
          () => codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
        ),
        opacity: 0.03 + Math.random() * 0.07,
      }))
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = "12px monospace"

      columnsRef.current.forEach((column) => {
        column.y += column.speed

        column.chars.forEach((char, charIndex) => {
          const y = column.y + charIndex * 20

          if (y > 0 && y < canvas.height) {
            const gradient = ctx.createLinearGradient(0, y - 10, 0, y + 10)
            gradient.addColorStop(0, `rgba(75, 16, 40, ${column.opacity})`)
            gradient.addColorStop(0.5, `rgba(122, 31, 61, ${column.opacity})`)
            gradient.addColorStop(1, `rgba(179, 74, 108, ${column.opacity * 0.5})`)

            ctx.fillStyle = gradient
            ctx.fillText(char, column.x, y)
          }
        })

        if (column.y > canvas.height) {
          column.y = -column.chars.length * 20
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
      style={{ background: "transparent" }}
    />
  )
}

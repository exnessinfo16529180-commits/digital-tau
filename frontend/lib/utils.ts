import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(input: string): string {
  const s = String(input ?? "")
  if (!s) return ""

  // Server-safe fallback.
  if (typeof window === "undefined") {
    return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  }

  const div = document.createElement("div")
  div.innerHTML = s
  return (div.textContent || "").replace(/\s+/g, " ").trim()
}

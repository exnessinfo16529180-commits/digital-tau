import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Digital TAU - Innovation & Research Showcase",
  description:
    "Showcasing cutting-edge innovation and research projects from M.H. Dulati Taraz Regional University. Where ideas meet technology.",
  keywords: [
    "TAU University",
    "Digital TAU",
    "Innovation",
    "Research",
    "Kazakhstan",
    "Taraz",
    "Technology",
  ],
  authors: [{ name: "TAU University" }],
  openGraph: {
    title: "Digital TAU - Innovation & Research Showcase",
    description:
      "Showcasing cutting-edge innovation and research projects from M.H. Dulati Taraz Regional University.",
    type: "website",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

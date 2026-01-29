"use client"

import React from "react"

import { I18nProvider } from "@/lib/i18n"
import { AuthProvider } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MatrixBackground } from "@/components/matrix-background"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <I18nProvider>
        <div className="min-h-screen bg-black text-white relative">
          <MatrixBackground />
          <Header />
          <main className="relative z-10 pt-16">{children}</main>
          <Footer />
        </div>
      </I18nProvider>
    </AuthProvider>
  )
}

"use client"

import React from "react"
import { useState, useEffect } from "react"
import { X, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth()
  const { t } = useI18n()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setUsername("")
      setPassword("")
      setShowPassword(false)
      setError("")
      setIsLoading(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const success = await login(username, password)
    if (success) {
      onSuccess?.()
      onClose()
    } else {
      setError(t("invalidCredentials"))
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-cyan border border-cyan-500/30 rounded-[2rem] overflow-hidden shadow-2xl shadow-cyan-500/10">
        <div className="relative p-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <ShieldCheck size={40} className="text-black" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">{t("adminLogin")}</h2>
            <p className="text-sm text-cyan-500/60 mt-2 font-bold uppercase tracking-widest">{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-4">{t("username")}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("enterUsername")}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-4">{t("password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterPassword")}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center uppercase tracking-widest">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl font-black text-black bg-cyan-500 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : t("login")}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl border border-white/5 bg-white/5 text-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {t("demoCredentials")}: <span className="text-white">admin / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

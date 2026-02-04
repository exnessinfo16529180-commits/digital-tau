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
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUsername("")
      setPassword("")
      setShowPassword(false)
      setError("")
      setIsLoading(false)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
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
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-md",
          "animate-in zoom-in-95 fade-in duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient border wrapper */}
        <div className="absolute inset-0 rounded-2xl gradient-bg opacity-50 blur-sm" />
        <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a0a]" />
        
        {/* Content */}
        <div className="relative p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">{t("adminLogin")}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t("loginSubtitle")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("username")}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("enterUsername")}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10",
                  "text-white placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-transparent focus:ring-2",
                  "focus:ring-[#7A1F3D]/50 transition-all duration-300"
                )}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterPassword")}
                  className={cn(
                    "w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10",
                    "text-white placeholder:text-muted-foreground",
                    "focus:outline-none focus:border-transparent focus:ring-2",
                    "focus:ring-[#7A1F3D]/50 transition-all duration-300"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                  rememberMe 
                    ? "gradient-bg border-transparent" 
                    : "border-white/20 hover:border-white/40"
                )}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-muted-foreground">{t("rememberMe")}</span>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-white",
                "gradient-bg hover:opacity-90 transition-opacity",
                "flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t("loggingIn")}
                </>
              ) : (
                t("login")
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground text-center">
              {t("demoCredentials")}: <span className="text-white">admin / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

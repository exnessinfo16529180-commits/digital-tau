"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

const STORAGE_KEY = "tau_admin_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // 1) local hint (for UI) — не гарантирует, что cookie-сессия ещё жива
      const storedAuth = localStorage.getItem(STORAGE_KEY)
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth)
          if (alive) setUser(parsed)
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      }

      // 2) реальная проверка cookie-сессии на бэке
      try {
        const res = await fetch(`${API_BASE}/api/admin/me`, { credentials: "include", cache: "no-store" })
        const data = res.ok ? await res.json().catch(() => null) : null
        const loggedIn = Boolean((data as any)?.loggedIn)
        if (!loggedIn) {
          if (alive) setUser(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        // если бэк недоступен — оставим только local state
      } finally {
        if (alive) setIsLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const form = new FormData()
      form.append("username", username)
      form.append("password", password)

      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        body: form,
        credentials: "include",
        cache: "no-store",
      })

      if (!res.ok) return false

      const userData = { username, email: `${username}@tau.edu.kz` }
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    fetch(`${API_BASE}/api/admin/logout`, { credentials: "include", cache: "no-store" }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

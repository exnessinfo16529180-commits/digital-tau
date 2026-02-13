"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Menu, X, ShieldCheck, LayoutDashboard, FolderKanban, Settings, LogOut, Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { LoginModal } from "@/components/login-modal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/", labelKey: "home" },
  { href: "/projects", labelKey: "projects" },
  { href: "/technologies", labelKey: "technologies" },
  { href: "/about", labelKey: "about" },
]

const languages = [
  { code: "ru" as const, label: "RU" },
  { code: "kz" as const, label: "KZ" },
  { code: "en" as const, label: "EN" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useI18n()
  const { isAuthenticated, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAdminDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setAdminDropdownOpen(!adminDropdownOpen)
    } else {
      setLoginModalOpen(true)
    }
  }

  const handleLogout = () => {
    logout()
    setAdminDropdownOpen(false)
    router.push("/")
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-2" : "py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className={cn(
            "flex items-center justify-between px-6 h-16 rounded-full transition-all duration-500",
            scrolled ? "glass-cyan border-cyan-500/20 shadow-lg shadow-cyan-500/10" : "bg-transparent border-transparent"
          )}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-cyan-500/30 overflow-hidden group-hover:scale-110 transition-transform">
                <img
                  src="/images/tau-logo.jpg"
                  alt="TAU Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white leading-none tracking-tighter text-lg group-hover:text-cyan-400 transition-colors">
                  DIGITAL TAU
                </span>
                <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest hidden sm:block">
                  Innovation Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-full",
                    mounted && pathname === item.href
                      ? "bg-cyan-500 text-black"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-black rounded-full transition-all",
                      language === lang.code
                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Admin Shield */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAdminClick}
                  className={cn(
                    "p-2.5 rounded-full transition-all border group relative overflow-hidden",
                    isAuthenticated
                      ? "bg-burgundy-uni/20 border-burgundy-uni/50 shadow-lg shadow-burgundy-uni/20"
                      : "bg-white/5 border-white/10 hover:border-cyan-500/50"
                  )}
                >
                  <ShieldCheck size={20} className={cn(
                    "transition-colors",
                    isAuthenticated ? "text-white" : "text-white/40 group-hover:text-cyan-400"
                  )} />
                  {isAuthenticated && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {adminDropdownOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 w-56 rounded-2xl glass-cyan border border-cyan-500/20 shadow-2xl p-2 z-[60]"
                    >
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-cyan-500/10 rounded-xl transition-all"
                      >
                        <LayoutDashboard size={18} className="text-cyan-400" />
                        {t("dashboard")}
                      </Link>
                      {/* ... other items */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <LogOut size={18} />
                        {t("logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-white/5 border border-white/10 text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
            >
              <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-2xl font-black uppercase tracking-tighter",
                      pathname === item.href ? "text-cyan-400" : "text-white/60"
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex gap-4">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          "text-lg font-black",
                          language === lang.code ? "text-cyan-400" : "text-white/20"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      isAuthenticated ? router.push("/admin") : setLoginModalOpen(true)
                    }}
                    className="p-4 rounded-full bg-cyan-500 text-black"
                  >
                    <ShieldCheck size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => router.push("/admin")}
      />
    </>
  )
}

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Menu, X, ShieldCheck, LayoutDashboard, FolderKanban, Settings, LogOut } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { LoginModal } from "@/components/login-modal"
import { cn } from "@/lib/utils"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
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

  const handleLoginSuccess = () => {
    router.push("/admin")
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img
                  src="/images/logo.jpeg"
                  alt="TAU University Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white hidden sm:block group-hover:gradient-text transition-all duration-300">
                TAU UNIVERSITY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-300 py-2",
                    pathname === item.href
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {t(item.labelKey)}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-0.5 gradient-bg transition-all duration-300",
                      pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              ))}
            </nav>

            {/* Right side: Language Switcher + Admin */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300",
                      language === lang.code
                        ? "gradient-bg text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Admin Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAdminClick}
                  className={cn(
                    "relative p-2 rounded-lg transition-all duration-300",
                    "bg-white/5 border border-white/10 hover:border-white/20",
                    "hover:bg-gradient-to-r hover:from-[#E91E63]/20 hover:to-[#FF9800]/20",
                    isAuthenticated && "border-[#E91E63]/30"
                  )}
                  title={t("adminPanel")}
                >
                  <ShieldCheck size={18} className="text-white/70" />
                  {/* Green dot indicator when logged in */}
                  {isAuthenticated && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
                  )}
                </button>

                {/* Admin Dropdown */}
                {adminDropdownOpen && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                      <Link
                        href="/admin"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href="/admin/projects"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FolderKanban size={16} />
                        {t("manageProjects")}
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Settings size={16} />
                        {t("settings")}
                      </Link>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors duration-300 py-2",
                      pathname === item.href
                        ? "gradient-text"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
              </nav>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300",
                        language === lang.code
                          ? "gradient-bg text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Mobile Admin Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (isAuthenticated) {
                      router.push("/admin")
                    } else {
                      setLoginModalOpen(true)
                    }
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                    "bg-white/5 border border-white/10",
                    isAuthenticated && "border-[#E91E63]/30"
                  )}
                >
                  <ShieldCheck size={16} className="text-white/70" />
                  <span className="text-white/70">{t("admin")}</span>
                  {isAuthenticated && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}

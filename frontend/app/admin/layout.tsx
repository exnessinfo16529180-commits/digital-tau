"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Cpu,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react"
import { I18nProvider, useI18n } from "@/lib/i18n"
import { AuthProvider, useAuth } from "@/lib/auth"
import { LoginModal } from "@/components/login-modal"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/admin/projects", icon: FolderKanban, labelKey: "manageProjects" },
  { href: "/admin/technologies", icon: Cpu, labelKey: "manageTech" },
  { href: "/admin/users", icon: Users, labelKey: "users" },
  { href: "/admin/settings", icon: Settings, labelKey: "settings" },
]

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass border border-white/10"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 z-40",
          "flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img
                src="/images/logo.jpeg"
                alt="TAU University Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-white">TAU Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isActive
                    ? "gradient-bg text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}

function AdminProtectedContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isLoading, isAuthenticated])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
  }

  const handleLoginClose = () => {
    setShowLoginModal(false)
    router.push("/")
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#E91E63]" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />
      </div>
    )
  }

  // Show admin content if authenticated
  return (
    <div className="min-h-screen bg-black text-white">
      <AdminSidebar />
      <main className="lg:ml-64 min-h-screen">{children}</main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <I18nProvider>
        <AdminProtectedContent>{children}</AdminProtectedContent>
      </I18nProvider>
    </AuthProvider>
  )
}

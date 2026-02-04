"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Github, Linkedin, Twitter, Mail, ShieldCheck } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { LoginModal } from "@/components/login-modal"

export function Footer() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const handleAdminClick = () => {
    if (isAuthenticated) {
      router.push("/admin")
    } else {
      setLoginModalOpen(true)
    }
  }

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Digital TAU */}
          <div>
            <h3 className="font-bold text-lg gradient-text mb-4">Digital TAU</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footerDesc")}
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-bold text-lg text-[#B34A6C] mb-4">{t("contacts")}</h3>
            <a
              href="mailto:contact@tau.edu.kz"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <Mail size={16} />
              contact@tau.edu.kz
            </a>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg text-[#7A1F3D] mb-4">{t("socialMedia")}</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Turan-Astana University */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Turan-Astana University</h3>
            <p className="text-sm text-muted-foreground">{t("universityName")}</p>
            <p className="text-sm text-muted-foreground">{t("tarazKazakhstan")}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 {t("copyright")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {t("terms")}
            </Link>
            <Link
              href="/accessibility"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {t("accessibility")}
            </Link>
            <span className="text-white/20">|</span>
            <button
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ShieldCheck size={14} />
              {t("admin")}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => router.push("/admin")}
      />
    </footer>
  )
}

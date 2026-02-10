"use client"

import { Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/10 bg-[#101014]/70 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg gradient-text mb-4">Digital TAU</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footerDesc")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#B34A6C] mb-4">{t("contacts")}</h3>
            <a
              href="https://digital.tau-edu.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <Globe size={16} />
              digital.tau-edu.kz
            </a>
          </div>

          <div>
            <h3 className="font-bold text-lg text-white mb-4">Turan-Astana University</h3>
            <p className="text-sm text-muted-foreground">{t("universityName")}</p>
            <p className="text-sm text-muted-foreground">{t("tarazKazakhstan")}</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">В© 2025 {t("copyright")}</p>
        </div>
      </div>
    </footer>
  )
}


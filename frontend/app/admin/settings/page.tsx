"use client"

import { useI18n } from "@/lib/i18n"
import { Globe, Bell, Shield, Palette } from "lucide-react"

export default function AdminSettingsPage() {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t("settings")}</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Language Settings */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Globe size={20} className="text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Language</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred language</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["en", "ru", "kz"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as "en" | "ru" | "kz")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  language === lang
                    ? "gradient-bg text-white"
                    : "bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Bell size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-sm text-muted-foreground">Manage notification preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-muted-foreground">Email notifications</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-pink-500" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-muted-foreground">Project updates</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-pink-500" />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Shield size={20} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Security</h3>
              <p className="text-sm text-muted-foreground">Manage your account security</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
            Change Password
          </button>
        </div>

        {/* Theme Settings */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Palette size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Theme</h3>
              <p className="text-sm text-muted-foreground">Customize appearance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl gradient-bg text-white font-medium">
              Dark
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-colors">
              Light
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

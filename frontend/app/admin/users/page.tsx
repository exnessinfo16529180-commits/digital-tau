"use client"

import { useI18n } from "@/lib/i18n"
import { Users, Shield, UserCheck } from "lucide-react"

const users = [
  { id: 1, name: "Admin User", email: "admin@tau.edu.kz", role: "Admin", status: "Active" },
  { id: 2, name: "Dr. Aigul Akhmetova", email: "a.akhmetova@tau.edu.kz", role: "Faculty", status: "Active" },
  { id: 3, name: "Nursultan Bekov", email: "n.bekov@tau.edu.kz", role: "Student", status: "Active" },
  { id: 4, name: "Aisha Suleimenova", email: "a.suleimenova@tau.edu.kz", role: "Student", status: "Active" },
]

export default function AdminUsersPage() {
  const { t } = useI18n()

  const roleLabel = (role: string) => {
    if (role === "Admin") return t("admin")
    if (role === "Faculty") return t("faculty")
    if (role === "Student") return t("student")
    return role
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t("users")}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-900/30 flex items-center justify-center">
              <Users size={24} className="text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-muted-foreground">{t("totalUsers")}</p>
            </div>
          </div>
        </div>
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-800/30 flex items-center justify-center">
              <Shield size={24} className="text-rose-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-muted-foreground">{t("admins")}</p>
            </div>
          </div>
        </div>
        <div className="glass border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-950/30 flex items-center justify-center">
              <UserCheck size={24} className="text-rose-200" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-muted-foreground">{t("active")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-muted-foreground font-medium">{t("name")}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("email")}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("role")}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user.role === "Admin" ? "bg-rose-900/30 text-rose-300" :
                      user.role === "Faculty" ? "bg-rose-800/30 text-rose-200" :
                      "bg-rose-700/20 text-rose-200"
                    }`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-rose-950/40 text-rose-200">
                      {t("active")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

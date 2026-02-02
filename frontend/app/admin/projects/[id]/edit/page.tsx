"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProjectEditor } from "@/app/admin/projects/_components/project-editor"

export default function AdminProjectEditPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const id = Array.isArray(params?.id) ? params?.id?.[0] : params?.id

  useEffect(() => {
    const raw = String(id ?? "").trim()
    if (!raw || raw === "undefined" || raw === "null" || !/^\d+$/.test(raw)) {
      router.replace("/admin/projects")
    }
  }, [id, router])

  const raw = String(id ?? "").trim()
  if (!raw || raw === "undefined" || raw === "null" || !/^\d+$/.test(raw)) return null

  return <ProjectEditor mode={{ kind: "edit", id: raw }} />
}

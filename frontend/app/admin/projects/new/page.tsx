"use client"

import { ProjectEditor } from "@/app/admin/projects/_components/project-editor"

export default function AdminProjectCreatePage() {
  return <ProjectEditor mode={{ kind: "create" }} />
}


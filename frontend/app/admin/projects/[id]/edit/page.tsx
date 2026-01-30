"use client"

import { ProjectEditor } from "@/app/admin/projects/_components/project-editor"

export default function AdminProjectEditPage({ params }: { params: { id: string } }) {
  return <ProjectEditor mode={{ kind: "edit", id: params.id }} />
}


"use client"

import { useEffect, useMemo, useRef } from "react"
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: string
  onChange: (html: string) => void
  className?: string
  minHeight?: number
}

function exec(cmd: string, arg?: string) {
  // execCommand is deprecated but still works across major browsers and is enough for a lightweight editor.
  document.execCommand(cmd, false, arg)
}

export function RichTextEditor({ label, value, onChange, className, minHeight = 180 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const lastValueRef = useRef<string>("")

  const buttons = useMemo(
    () => [
      { icon: Bold, title: "Bold", onClick: () => exec("bold") },
      { icon: Italic, title: "Italic", onClick: () => exec("italic") },
      { icon: Underline, title: "Underline", onClick: () => exec("underline") },
      { icon: List, title: "Bulleted list", onClick: () => exec("insertUnorderedList") },
      { icon: ListOrdered, title: "Numbered list", onClick: () => exec("insertOrderedList") },
      {
        icon: LinkIcon,
        title: "Link",
        onClick: () => {
          const url = prompt("URL (https://...)")
          if (!url) return
          exec("createLink", url)
        },
      },
    ],
    []
  )

  useEffect(() => {
    if (!ref.current) return
    if (value === lastValueRef.current) return
    ref.current.innerHTML = value || ""
    lastValueRef.current = value || ""
  }, [value])

  function emit() {
    const html = ref.current?.innerHTML || ""
    lastValueRef.current = html
    onChange(html)
  }

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm text-muted-foreground mb-2">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {buttons.map((b) => {
          const Icon = b.icon
          return (
            <button
              key={b.title}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={b.onClick}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10
                         text-white/80 hover:text-white hover:border-white/20 transition-colors"
              title={b.title}
            >
              <Icon size={16} />
              <span className="text-xs">{b.title}</span>
            </button>
          )
        })}
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        className={cn(
          "w-full px-4 py-3 rounded-xl glass border border-white/10 text-white",
          "focus:outline-none focus:border-white/30 transition-colors",
          "bg-transparent"
        )}
        style={{ minHeight }}
      />

      <p className="text-xs text-muted-foreground mt-2">
        Tip: use the toolbar for lists/links and formatting. Content is saved as rich text (HTML).
      </p>
    </div>
  )
}


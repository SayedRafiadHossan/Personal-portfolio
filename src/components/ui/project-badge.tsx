import { cn } from "@/lib/utils"

export type ProjectKind = "open-source" | "team" | "collection"

const kinds: Record<ProjectKind, { label: string; dot: string }> = {
  "open-source": { label: "Open source", dot: "bg-emerald-400" },
  team: { label: "Team project", dot: "bg-sky-400" },
  collection: { label: "Collection", dot: "bg-violet-400" },
}

/** Glass pill marking what kind of project this is; sits over a project image. */
export const ProjectBadge = ({
  kind,
  stars,
  className,
}: {
  kind: ProjectKind
  /** GitHub stars, shown after the label when known. */
  stars?: number
  className?: string
}) => {
  const { label, dot } = kinds[kind]

  return (
    <span
      className={cn(
        "pointer-events-none inline-flex items-center gap-2 rounded-full border border-background-2/15 bg-background-1/65 px-3 py-1.5 font-aspekta-500 text-tagline-4 text-background-2 backdrop-blur-md",
        className
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />
      {label}
      {stars !== undefined && (
        <>
          <span aria-hidden className="h-3 w-px bg-background-2/25" />
          <span className="inline-flex items-center gap-1 tabular-nums">
            <svg aria-hidden viewBox="0 0 16 16" className="size-3 fill-current">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {stars.toLocaleString("en-US")}
            <span className="sr-only">GitHub stars</span>
          </span>
        </>
      )}
    </span>
  )
}

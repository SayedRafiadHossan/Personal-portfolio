import { cn } from "@/lib/utils"

type BadgeProps = Readonly<{
  children: React.ReactNode
  className?: string
}>

export const Badge = ({ children, className }: BadgeProps) => {
  return (
    <div
      className={cn(
        "bg-background-1/5 inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        className
      )}
    >
      <span
        className="size-2 shrink-0 rounded-full bg-[#22c55e]"
        aria-hidden
      />
      <span className="text-background-1 text-tagline-3 font-medium">
        {children}
      </span>
    </div>
  )
}

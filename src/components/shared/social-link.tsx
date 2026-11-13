import { cn } from "@/lib/utils"

type SocialLinkProps = Readonly<{
  href: string
  label: string
  variant?: "default" | "inverse"
  className?: string
  tabIndex?: number
  children: React.ReactNode
}>

const variantClass = {
  default:
    "border-background-1/10 text-background-1 hover:bg-background-1/5",
  inverse:
    "border-background-2/10 text-background-2 hover:bg-background-2/5",
} as const

export const SocialLink = ({
  href,
  label,
  variant = "default",
  className,
  tabIndex,
  children,
}: SocialLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      tabIndex={tabIndex}
      className={cn(
        "group relative grid size-10 overflow-hidden rounded-[10px] border transition-colors",
        variantClass[variant],
        className
      )}
    >
      <span className="col-start-1 row-start-1 flex size-full items-center justify-center transition-transform duration-500 ease-bouncy group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {children}
      </span>
      <span
        className="col-start-1 row-start-1 flex size-full translate-y-full items-center justify-center transition-transform duration-500 ease-bouncy group-hover:translate-y-0 motion-reduce:translate-y-full motion-reduce:transition-none"
        aria-hidden
      >
        {children}
      </span>
    </a>
  )
}

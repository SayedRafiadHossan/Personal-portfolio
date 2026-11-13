import { cn } from "@/lib/utils"

export const buttonVariantsList = [
  "default",
  "inverse",
  "accent",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const

export const buttonSizes = ["default", "sm", "lg", "icon"] as const

export type ButtonVariant = (typeof buttonVariantsList)[number]
export type ButtonSize = (typeof buttonSizes)[number]

export type ButtonVariantProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

const variantClass: Record<ButtonVariant, string> = {
  default: "bg-background-1 text-background-2",
  inverse: "bg-[#6b6b6b]/10 text-background-1",
  accent: "bg-background-1 text-background-2",
  destructive: "bg-red-600 text-white",
  outline: "bg-transparent text-background-1",
  secondary: "bg-background-1/5 text-background-1",
  ghost: "bg-transparent text-background-1",
  link: "rounded-none bg-transparent text-background-1 underline-offset-4",
}

const sizeClass: Record<ButtonSize, string> = {
  default: "h-12 px-7",
  sm: "px-4 py-2 text-tagline-3",
  lg: "px-6 py-3.5",
  icon: "size-11 p-0",
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: ButtonVariantProps = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2.5 rounded-full border-0 font-aspekta-550 text-tagline-2 tracking-[-0.01em] whitespace-nowrap shadow-none ring-0 outline-none select-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    variantClass[variant],
    sizeClass[size],
    className
  )
}

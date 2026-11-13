import { cn } from "@/lib/utils"
import type { SVGProps } from "react"

type IconProps = Readonly<SVGProps<SVGSVGElement>>

export function StarIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden {...props}>
      <path
        d="M16.3858 1.28418C16.3858 15.331 15.6054 16.1114 1.55859 16.1114C15.6054 16.1114 16.3858 16.8918 16.3858 30.9386C16.3858 16.8918 17.1662 16.1114 31.213 16.1114C17.1662 16.1114 16.3858 15.331 16.3858 1.28418Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function XIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5.5", className)}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M8 2H1L9.26086 13.0145L1.44995 21.9999H4.09998L10.4883 14.651L16 22H23L14.3917 10.5223L21.8001 2H19.1501L13.1643 8.88578L8 2ZM17 20L5 4H7L19 20H17Z" />
    </svg>
  )
}

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5.5", className)}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z" />
    </svg>
  )
}

export function LinkedInIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5.5", className)}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
    </svg>
  )
}

export function GitHubIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5.5", className)}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M12.001 2C6.476 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.56 9.56 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.337-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-9.999-10Z" />
    </svg>
  )
}

export function MailIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5.5", className)}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.01L12 13l8-6.99V6H4Zm16 12V8.25l-7.4 6.48a1 1 0 0 1-1.2 0L4 8.25V18h16Z" />
    </svg>
  )
}

export function GoogleMeetIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-5", className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fill="#FF8F00" d="M30 16v16l10.5 8V8L30 16z" />
      <path
        fill="#00AC47"
        d="M8 16h22v16H8c-2.2 0-4-1.8-4-4v-8c0-2.2 1.8-4 4-4z"
      />
      <path
        fill="#00832D"
        d="M8 16h11v16H8c-2.2 0-4-1.8-4-4v-8c0-2.2 1.8-4 4-4z"
      />
      <path fill="#2684FC" d="M19 16h11v8H19z" />
      <path fill="#0066DA" d="M19 24h11v8H19z" />
      <path fill="#EA4335" d="M30 24l10.5 8V24H30z" />
    </svg>
  )
}

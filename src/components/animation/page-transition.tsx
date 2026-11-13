"use client"

import { useLenis } from "lenis/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react"

type Navigate = (href: string) => void

const PageTransitionContext = createContext<Navigate | null>(null)

// The browser gives up on a view transition after ~4s; resolve before that so
// a slow route never leaves the old snapshot frozen on screen.
const UPDATE_TIMEOUT_MS = 3000

export const PageTransitionProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const router = useRouter()
  const pathname = usePathname()
  const lenis = useLenis()
  const pending = useRef<{ resolve: () => void; hash: string } | null>(null)
  const active = useRef<ViewTransition | null>(null)

  // Runs after the new route has committed (and after Lenis has reset its
  // scroll), so the "new" snapshot is the top of the incoming page.
  useEffect(() => {
    const current = pending.current
    if (!current) return
    pending.current = null

    if (current.hash) {
      const target = document.querySelector(current.hash)
      if (target) {
        // force: the nav menu stops Lenis while it is open.
        if (lenis) {
          lenis.scrollTo(target as HTMLElement, {
            immediate: true,
            force: true,
          })
        } else {
          target.scrollIntoView()
        }
      }
    }

    current.resolve()
  }, [pathname, lenis])

  const navigate = useCallback<Navigate>(
    (href) => {
      const url = new URL(href, window.location.href)
      const samePage = url.pathname === window.location.pathname
      const canAnimate =
        typeof document.startViewTransition === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (samePage || !canAnimate) {
        router.push(href)
        return
      }

      active.current?.skipTransition()
      pending.current?.resolve()

      active.current = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timeout = window.setTimeout(resolve, UPDATE_TIMEOUT_MS)
            pending.current = {
              hash: url.hash,
              resolve: () => {
                window.clearTimeout(timeout)
                resolve()
              },
            }
            router.push(`${url.pathname}${url.search}${url.hash}`)
          })
      )
      active.current.finished.finally(() => {
        active.current = null
      })
    },
    [router]
  )

  return (
    <PageTransitionContext.Provider value={navigate}>
      {children}
    </PageTransitionContext.Provider>
  )
}

export const usePageTransition = () => {
  const navigate = useContext(PageTransitionContext)
  if (!navigate) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider"
    )
  }
  return navigate
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string
}

/** next/link that routes through the page transition on plain left clicks. */
export const TransitionLink = ({
  href,
  onClick,
  ...props
}: TransitionLinkProps) => {
  const navigate = usePageTransition()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    ) {
      return
    }
    event.preventDefault()
    navigate(href)
  }

  return <Link href={href} onClick={handleClick} {...props} />
}

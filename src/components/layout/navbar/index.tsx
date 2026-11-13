"use client"

import {
  FacebookIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  XIcon,
} from "@/components/shared/icons"
import {
  TransitionLink,
  usePageTransition,
} from "@/components/animation/page-transition"
import { SocialLink } from "@/components/shared/social-link"
import { navLinks, navSocials, profile } from "@/data/data"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { useHideOnScroll } from "./use-hide-on-scroll"
import { useNavbar, type NavbarRefs } from "./use-navbar"

type NavbarProps = Readonly<{
  children: ReactNode
}>

const easeOut = "ease-[cubic-bezier(0.32,0.72,0,1)]"

const socialIcons = {
  Facebook: FacebookIcon,
  X: XIcon,
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
  Email: MailIcon,
} as const

const hashFromHref = (href: string) => {
  const index = href.indexOf("#")
  return index === -1 ? "" : href.slice(index)
}

const linkIsCurrent = (href: string, pathname: string, hash: string) => {
  const linkHash = hashFromHref(href)
  if (!linkHash) return pathname === href
  if (pathname !== "/") return false
  if (!hash || hash === "#" || hash === "#hero") {
    return linkHash === "#hero"
  }
  return hash === linkHash
}

const setAt =
  (bag: { current: (HTMLElement | null)[] }, index: number) =>
  (el: HTMLElement | null) => {
    bag.current[index] = el
  }

const NavLinkLabel = ({ children }: { children: string }) => (
  <span className="relative block overflow-hidden font-aspekta-550 text-[2em] leading-[0.95] tracking-[-0.04em] md:text-[clamp(2rem,3.4vw,3.25em)]">
    <span className="block transition-transform duration-500 ease-bouncy group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
      {children}
    </span>
    <span
      className="absolute inset-0 translate-y-full transition-transform duration-500 ease-bouncy group-hover:translate-y-0 motion-reduce:translate-y-full motion-reduce:transition-none"
      aria-hidden
    >
      {children}
    </span>
  </span>
)

export function Navbar({ children }: NavbarProps) {
  const pathname = usePathname()
  const navigate = usePageTransition()
  const [isOpen, setOpen] = useState(false)
  const [hash, setHash] = useState("")

  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const pendingHashRef = useRef<string | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const darkRef = useRef<HTMLDivElement>(null)
  const borderRef = useRef<HTMLDivElement>(null)
  const barRefs = useRef<(HTMLElement | null)[]>([])
  const largeItemRefs = useRef<(HTMLElement | null)[]>([])
  const smallItemRefs = useRef<(HTMLElement | null)[]>([])
  const cornerRefs = useRef<(HTMLElement | null)[]>([])
  const borderRowRefs = useRef<(HTMLElement | null)[]>([])

  const refs = useMemo<NavbarRefs>(
    () => ({
      main: mainRef,
      menu: menuRef,
      overlay: overlayRef,
      dark: darkRef,
      border: borderRef,
      bars: barRefs,
      largeItems: largeItemRefs,
      smallItems: smallItemRefs,
      corners: cornerRefs,
      borderRows: borderRowRefs,
    }),
    []
  )

  useNavbar({ isOpen, refs, pendingHashRef })
  useHideOnScroll(headerRef, isOpen)

  useEffect(() => {
    const sync = () => setHash(window.location.hash)
    sync()
    window.addEventListener("hashchange", sync)
    window.addEventListener("popstate", sync)
    return () => {
      window.removeEventListener("hashchange", sync)
      window.removeEventListener("popstate", sync)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      toggleRef.current?.focus()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  const close = useCallback(() => setOpen(false), [])

  const onNavLinkClick = (href: string) => {
    const linkHash = hashFromHref(href)
    // Different route: hand off to the page transition (it scrolls to the hash).
    if (!linkHash || pathname !== "/") {
      close()
      navigate(href)
      return
    }
    pendingHashRef.current = linkHash
    setHash(linkHash)
    window.history.pushState(null, "", linkHash)
    close()
  }

  return (
    <>
      <header
        ref={headerRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-110 text-background-1 [view-transition-name:site-header]"
      >
        <div className="pointer-events-none flex items-center justify-between p-[clamp(1.25rem,3.5vw,2.5rem)] *:pointer-events-auto">
          <TransitionLink
            data-nav-slide="left"
            href="/#hero"
            className="inline-flex items-center"
            aria-label={`${profile.shortName} home`}
          >
            <Image
              src="/images/my-logo.svg"
              alt=""
              width={612}
              height={490}
              className="block h-[1.85rem] w-auto md:h-9"
              priority
            />
          </TransitionLink>

          <button
            ref={toggleRef}
            data-nav-slide="right"
            type="button"
            aria-expanded={isOpen}
            aria-controls="nav-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setOpen((open) => !open)}
            className="-m-4 flex cursor-pointer items-center justify-center border-0 bg-transparent p-4 text-inherit outline-none [-webkit-tap-highlight-color:transparent] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            <span
              className="relative flex size-6 shrink-0 flex-col items-center justify-center gap-[0.375em] overflow-visible"
              aria-hidden="true"
            >
              <span
                ref={setAt(barRefs, 0)}
                className="h-0.5 w-full shrink-0 origin-center bg-current"
              />
              <span
                ref={setAt(barRefs, 1)}
                className="h-0.5 w-full shrink-0 origin-center bg-current"
              />
            </span>
          </button>
        </div>
      </header>

      <nav
        ref={menuRef}
        className="fixed inset-y-0 right-0 z-1 w-[min(80vw,22rem)] overflow-hidden bg-white text-background-1 min-[1600px]:w-[32em] md:w-[30em]"
        id="nav-menu"
        aria-label="Primary"
        aria-hidden={!isOpen}
      >
        <div className="flex h-full w-full scrollbar-none flex-col items-stretch justify-between gap-8 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pt-20 pb-5 md:px-8 md:pt-[7.5em] md:pb-8">
          <ul className="m-0 flex w-full list-none flex-col overflow-hidden p-0">
            {navLinks.map((link, index) => {
              const current = linkIsCurrent(link.href, pathname, hash)
              return (
                <li
                  key={link.href}
                  ref={setAt(largeItemRefs, index)}
                  className="overflow-hidden"
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "group block w-full rounded-[0.3em] px-[0.9em] py-[0.7em] transition-[background-color,color,padding-left] duration-300",
                      easeOut,
                      current
                        ? "bg-background-1 text-white hover:pl-[1.45em] hover:brightness-[1.08]"
                        : "hover:bg-black/4 hover:pl-[1.45em]"
                    )}
                    aria-current={current ? "page" : undefined}
                    tabIndex={isOpen ? undefined : -1}
                    onClick={(event) => {
                      event.preventDefault()
                      onNavLinkClick(link.href)
                    }}
                  >
                    <NavLinkLabel>{link.label}</NavLinkLabel>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="relative flex w-full flex-col items-start justify-start gap-7 overflow-hidden px-[0.9em] pt-6 contain-[layout_paint] md:flex-row md:gap-0 md:px-0">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-4 overflow-hidden">
              <div
                ref={setAt(smallItemRefs, 0)}
                className="block overflow-hidden leading-[1.2]"
              >
                <span className="pointer-events-none relative inline-block pb-[0.12em] font-aspekta-450 text-[1em] leading-[1.2] opacity-45">
                  Socials
                </span>
              </div>
              <ul className="m-0 flex w-full list-none flex-row items-center gap-x-2 overflow-hidden p-0 sm:gap-3">
                {navSocials.map((social, index) => {
                  const Icon = socialIcons[social.label]
                  return (
                    <li
                      key={social.href}
                      ref={setAt(smallItemRefs, index + 1)}
                      className="overflow-hidden"
                      onClick={close}
                    >
                      <SocialLink
                        href={social.href}
                        label={social.label}
                        tabIndex={isOpen ? undefined : -1}
                      >
                        <Icon />
                      </SocialLink>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div
              ref={borderRef}
              className="absolute inset-x-0 top-0 h-px w-full origin-left bg-current opacity-15"
            />
          </div>
        </div>
      </nav>

      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 -right-px z-100 cursor-pointer overflow-clip",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        onClick={close}
      >
        <div ref={darkRef} className="absolute inset-0 bg-black/38 opacity-0" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-stretch justify-between">
          <div
            ref={setAt(borderRowRefs, 0)}
            className="flex flex-col items-end justify-start"
          >
            <div className="h-4 w-full bg-white" />
            <div
              ref={setAt(cornerRefs, 0)}
              className="size-8 origin-top-right bg-[radial-gradient(circle_farthest-side_at_0_100%,transparent_99%,#fff)]"
            />
          </div>
          <div
            ref={setAt(borderRowRefs, 1)}
            className="flex flex-col items-end justify-start"
          >
            <div
              ref={setAt(cornerRefs, 1)}
              className="size-8 origin-bottom-right bg-[radial-gradient(circle_farthest-side_at_0_0,transparent_99%,#fff)]"
            />
            <div className="h-4 w-full bg-white" />
          </div>
        </div>
      </div>

      <div
        ref={mainRef}
        className={cn(
          "relative z-2 min-h-dvh bg-background-2",
          isOpen && "will-change-transform"
        )}
      >
        {children}
      </div>
    </>
  )
}

"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ReactLenis, useLenis } from "lenis/react"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

type SmoothScrollingProps = Readonly<{
  children: ReactNode
}>

const LenisEffects = () => {
  const pathname = usePathname()
  const previousPathnameRef = useRef(pathname)
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    const raf = (time: number) => lenis.raf(time * 1000)
    const offScroll = lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()

    return () => {
      offScroll()
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [lenis])

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      lenis?.scrollTo(0, { immediate: true })
    }
    previousPathnameRef.current = pathname
  }, [pathname, lenis])

  return null
}

const SmoothScrollProvider = ({ children }: SmoothScrollingProps) => {
  return (
    <ReactLenis root options={{ duration: 1.1, autoRaf: false }}>
      <LenisEffects />
      {children}
    </ReactLenis>
  )
}

export default SmoothScrollProvider

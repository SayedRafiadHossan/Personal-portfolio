import gsap from "gsap"

type ContextSafeFunc = <T extends (...args: never[]) => unknown>(fn: T) => T

export const fallingMediaSources = [
  "/images/404-img-1.jpg",
  "/images/404-img-2.jpg",
  "/images/404-img-3.jpg",
  "/images/404-img-4.jpg",
  "/images/404-img-5.jpg",
  "/images/404-img-6.jpg",
] as const

const MAX_LIVE = 12
const BOTTOM_GUARD = 200

const photoClassName =
  "pointer-events-none absolute top-0 left-0 z-5 size-[15vw] rounded-[4%] object-cover will-change-transform max-md:size-[35vw]"

export const attachFallingMedia = (
  root: HTMLElement,
  sources: readonly string[],
  contextSafe: ContextSafeFunc
) => {
  if (sources.length === 0) return () => {}

  let incr = 0
  let oldIncrX = 0
  let oldIncrY = 0
  let firstMove = true
  let indexImg = 0
  let live = 0

  const isCoarsePointer = window.matchMedia("(hover: none)").matches

  sources.forEach((src) => {
    const preload = new Image()
    preload.src = src
  })

  const resetDist = () => window.innerWidth / (isCoarsePointer ? 6 : 8)

  const createMedia = contextSafe(
    (x: number, y: number, deltaX: number, deltaY: number) => {
      const height = window.innerHeight
      if (y > height - BOTTOM_GUARD || live >= MAX_LIVE) return

      const src = sources[indexImg % sources.length]
      indexImg += 1

      const image = document.createElement("img")
      image.src = src
      image.alt = ""
      image.draggable = false
      image.decoding = "async"
      image.dataset.fallingMedia = ""
      image.setAttribute("aria-hidden", "true")
      image.className = photoClassName
      root.appendChild(image)
      live += 1

      const tl = gsap.timeline({
        onComplete: () => {
          image.remove()
          live -= 1
          tl.kill()
        },
      })

      tl.fromTo(
        image,
        {
          xPercent: -50 + (Math.random() - 0.5) * 80,
          yPercent: -50 + (Math.random() - 0.5) * 10,
          scaleX: 1.3,
          scaleY: 1.3,
          rotation: (Math.random() - 0.5) * 20,
        },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "elastic.out(2, 0.6)",
          duration: 0.4,
        }
      )

      tl.fromTo(
        image,
        { x },
        {
          x: "+=" + deltaX * 2,
          rotation: 0,
          ease: "power1.in",
          duration: 0.4,
        },
        "<"
      )

      tl.fromTo(
        image,
        { y },
        {
          y: "+=" + (height - y),
          scale: 0.9,
          yPercent: -95,
          ease: "back.in(1.1)",
          duration: 0.4,
        },
        "<"
      )

      tl.to(image, {
        x: "+=" + deltaX * 1.6,
        rotation: (Math.random() - 0.5) * 40,
        ease: "power1.in",
        duration: 0.3,
      })

      tl.to(
        image,
        {
          yPercent: 150,
          ease: "back.in(" + (1.5 + (1 - y / height)) + ")",
          duration: 0.3,
        },
        "<"
      )
    }
  )

  const applyMove = (clientX: number, clientY: number) => {
    const width = window.innerWidth
    const height = window.innerHeight
    const valX = gsap.utils.clamp(0, width, clientX)
    const valY = gsap.utils.clamp(0, height, clientY)

    if (firstMove) {
      firstMove = false
      oldIncrX = valX
      oldIncrY = valY
      return
    }

    incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY)

    if (incr > resetDist()) {
      incr = 0
      createMedia(
        valX,
        valY - root.getBoundingClientRect().top,
        valX - oldIncrX,
        valY - oldIncrY
      )
    }

    oldIncrX = valX
    oldIncrY = valY
  }

  const handleMouseMove = contextSafe((event: MouseEvent) => {
    applyMove(event.clientX, event.clientY)
  })

  const handleTouchMove = contextSafe((event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    applyMove(touch.clientX, touch.clientY)
  })

  root.addEventListener("mousemove", handleMouseMove)
  root.addEventListener("touchstart", handleTouchMove, { passive: true })
  root.addEventListener("touchmove", handleTouchMove, { passive: true })

  return () => {
    root.removeEventListener("mousemove", handleMouseMove)
    root.removeEventListener("touchstart", handleTouchMove)
    root.removeEventListener("touchmove", handleTouchMove)
    root
      .querySelectorAll<HTMLImageElement>("[data-falling-media]")
      .forEach((image) => image.remove())
  }
}

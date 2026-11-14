import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"

export const STEP_ANGLE = 30
export const TICK_STEP = 3
export const CX = 50
export const CY = 50
export const OUTER_R = 47.9
export const INNER_R = 45.5
export const CHANNEL_R = (OUTER_R + INNER_R) / 2
export const CHANNEL_C = 2 * Math.PI * CHANNEL_R
export const EASE_OUT = "power2.out"
export const EASE_OUT_STRONG = "power3.out"

const FALLOFF = STEP_ANGLE * 0.92
const FACE_SCALE = gsap.utils.interpolate(0.96, 1)
const FACE_ALPHA = gsap.utils.interpolate(0.14, 1)
const TANGENT_SCALE = gsap.utils.interpolate(0.52, 1)
const TANGENT_ALPHA = gsap.utils.interpolate(0.2, 1)

/** Writes a style only when its value changed, to avoid restyling on idle frames. */
const setStyle = (el: HTMLElement | SVGElement, prop: "transform" | "opacity" | "visibility", value: string) => {
  if (el.style[prop] !== value) el.style[prop] = value
}

export const ensureBouncyEase = () => {
  if (!CustomEase.get("bouncy-ease")) {
    CustomEase.create("bouncy-ease", "0.34, 1.42, 0.64, 1")
  }
}

export const proximity = (worldAngle: number) =>
  gsap.utils.clamp(0, 1, 1 - Math.abs(worldAngle) / FALLOFF)

export const applyDialFaces = (
  faces: HTMLElement[],
  wheelRotation: number,
  options?: { tangent?: boolean; angleSign?: number }
) => {
  const angleSign = options?.angleSign ?? 1
  const tangent = options?.tangent ?? false
  const scaleMap = tangent ? TANGENT_SCALE : FACE_SCALE
  const alphaMap = tangent ? TANGENT_ALPHA : FACE_ALPHA

  // Runs on every scroll frame, so styles are written directly (origin is set in CSS)
  // rather than through gsap.set, which re-parses every property each call.
  faces.forEach((el, i) => {
    const world = i * STEP_ANGLE * angleSign + wheelRotation
    const t = proximity(world)
    const rotation = tangent ? 0 : -world
    const alpha = alphaMap(t)
    setStyle(el, "transform", `rotate(${rotation.toFixed(2)}deg) scale(${scaleMap(t).toFixed(4)})`)
    setStyle(el, "opacity", alpha.toFixed(3))
    setStyle(el, "visibility", alpha > 0 ? "inherit" : "hidden")
  })
}

export const applyProgressArc = (
  el: SVGCircleElement,
  spin: SVGGElement | null,
  rotation: number,
  maxRotation: number
) => {
  const t = maxRotation ? gsap.utils.clamp(0, 1, rotation / maxRotation) : 0
  const drawnDeg = t * Math.abs(maxRotation)
  const drawn = (drawnDeg / 360) * CHANNEL_C
  const dash = `${drawn.toFixed(3)} ${CHANNEL_C}`
  if (el.getAttribute("stroke-dasharray") !== dash) {
    el.setAttribute("stroke-dasharray", dash)
  }
  setStyle(el, "opacity", drawn < 0.02 ? "0" : "1")
  if (spin) {
    // A plain SVG rotate about the centre: gsap's svgOrigin measures the element
    // on every call, which forced a layout on each scroll frame.
    const turn = `rotate(${(-drawnDeg).toFixed(2)} ${CX} ${CY})`
    if (spin.getAttribute("transform") !== turn) spin.setAttribute("transform", turn)
  }
}

type ContentParts = {
  title: HTMLElement | null
  body: HTMLElement | null
  tags: HTMLElement[]
}

const contentParts = (el: HTMLElement): ContentParts => ({
  title: el.querySelector<HTMLElement>("[data-about-title]"),
  body: el.querySelector<HTMLElement>("[data-about-body]"),
  tags: gsap.utils.toArray<HTMLElement>("[data-about-tag]", el),
})

const setContentA11y = (el: HTMLElement, isActive: boolean) => {
  el.setAttribute("aria-hidden", isActive ? "false" : "true")
  if (isActive) el.removeAttribute("inert")
  else el.setAttribute("inert", "")
}

const isHidden = (el: HTMLElement) =>
  Number(gsap.getProperty(el, "opacity")) < 0.02

/**
 * Hidden and staying hidden. A slide still waiting on its enter delay reads as
 * hidden but is about to show, and gsap.isTweening() misses tweens that haven't
 * started yet, so check for any queued tween at all.
 */
const isSettledHidden = (el: HTMLElement) =>
  isHidden(el) && gsap.getTweensOf(el).length === 0

const setContentImmediate = (
  el: HTMLElement,
  { title, body, tags }: ContentParts,
  isActive: boolean
) => {
  gsap.killTweensOf([el, title, body, ...tags].filter(Boolean))
  gsap.set(el, { autoAlpha: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 })
  if (title) gsap.set(title, { yPercent: 0, autoAlpha: 1 })
  if (body) gsap.set(body, { autoAlpha: isActive ? 1 : 0, y: 0 })
  if (tags.length) gsap.set(tags, { autoAlpha: isActive ? 1 : 0, y: 0 })
}

const enterContent = (
  el: HTMLElement,
  { title, body, tags }: ContentParts,
  direction: number
) => {
  const fresh = isHidden(el)
  gsap.set(el, { zIndex: 2 })

  if (fresh) {
    if (title) gsap.set(title, { yPercent: 105 * direction })
    if (body) gsap.set(body, { autoAlpha: 0, y: 24 * direction })
    if (tags.length) gsap.set(tags, { autoAlpha: 0, y: 12 * direction })
  }

  gsap.to(el, {
    autoAlpha: 1,
    duration: 0.2,
    delay: fresh ? 0.08 : 0,
    ease: EASE_OUT,
    overwrite: true,
  })
  if (title) {
    gsap.to(title, {
      yPercent: 0,
      duration: 0.6,
      delay: fresh ? 0.08 : 0,
      ease: EASE_OUT_STRONG,
      overwrite: true,
    })
  }
  if (body) {
    gsap.to(body, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      delay: fresh ? 0.14 : 0,
      ease: EASE_OUT,
      overwrite: true,
    })
  }
  if (tags.length) {
    gsap.to(tags, {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      delay: fresh ? 0.2 : 0,
      stagger: 0.03,
      ease: EASE_OUT,
      overwrite: true,
    })
  }
}

const exitContent = (
  el: HTMLElement,
  { title, body, tags }: ContentParts,
  direction: number
) => {
  gsap.set(el, { zIndex: 1 })
  if (title) {
    gsap.to(title, {
      yPercent: -105 * direction,
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    })
  }
  if (body) {
    gsap.to(body, {
      autoAlpha: 0,
      y: -14 * direction,
      duration: 0.22,
      ease: "power2.in",
      overwrite: true,
    })
  }
  if (tags.length) {
    gsap.to(tags, {
      autoAlpha: 0,
      y: -8 * direction,
      duration: 0.2,
      ease: "power2.in",
      overwrite: true,
    })
  }
  gsap.to(el, {
    autoAlpha: 0,
    duration: 0.3,
    ease: "power2.in",
    overwrite: true,
  })
}

export const applyContent = (
  el: HTMLElement,
  isActive: boolean,
  immediate: boolean,
  direction: number
) => {
  const parts = contentParts(el)
  setContentA11y(el, isActive)
  if (immediate) {
    setContentImmediate(el, parts, isActive)
    return
  }
  if (isActive) enterContent(el, parts, direction)
  else if (!isSettledHidden(el)) exitContent(el, parts, direction)
}

export const applyImage = (
  el: HTMLElement,
  isActive: boolean,
  immediate: boolean,
  direction: number
) => {
  if (el.parentElement) {
    gsap.set(el.parentElement, { zIndex: isActive ? 2 : 1 })
  }

  if (immediate) {
    gsap.killTweensOf(el)
    gsap.set(el, {
      autoAlpha: isActive ? 1 : 0,
      y: 0,
      rotation: 0,
      scale: 1,
      transformOrigin: "50% 50%",
    })
    return
  }

  if (isActive) {
    if (isHidden(el)) {
      gsap.set(el, {
        y: 28 * direction,
        rotation: 5 * direction,
        scale: 0.94,
        transformOrigin: "50% 50%",
      })
    }
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.6,
      ease: EASE_OUT_STRONG,
      overwrite: true,
    })
    return
  }

  if (isSettledHidden(el)) return

  gsap.to(el, {
    autoAlpha: 0,
    y: -20 * direction,
    rotation: -4 * direction,
    scale: 0.96,
    duration: 0.3,
    ease: "power2.in",
    overwrite: true,
  })
}

export const applyNowDot = (el: Element, immediate: boolean) => {
  if (immediate) {
    gsap.set(el, { scale: 1 })
    return
  }
  gsap.fromTo(
    el,
    { scale: 0.7 },
    { scale: 1, duration: 0.45, ease: "bouncy-ease", overwrite: true }
  )
}

export const applyIndex = (
  el: HTMLElement,
  value: string,
  immediate: boolean,
  direction: number
) => {
  el.textContent = value
  if (immediate) {
    gsap.set(el, { yPercent: 0, autoAlpha: 1 })
    return
  }
  gsap.fromTo(
    el,
    { yPercent: 85 * direction, autoAlpha: 0 },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: EASE_OUT,
      overwrite: "auto",
    }
  )
}

export const pulseNeedle = (el: Element, immediate: boolean) => {
  if (immediate) {
    gsap.set(el, { autoAlpha: 1 })
    return
  }
  gsap.fromTo(
    el,
    { autoAlpha: 0.4 },
    { autoAlpha: 1, duration: 0.35, ease: EASE_OUT, overwrite: true }
  )
}

import type { Ref } from "react"

import { aboutSlides, profile } from "@/data/data"
import { cn } from "@/lib/utils"

import { slideNumber } from "./about-slide-number"
import {
  CHANNEL_C,
  CHANNEL_R,
  CX,
  CY,
  INNER_R,
  OUTER_R,
  STEP_ANGLE,
  TICK_STEP,
} from "./motion"
import { type SlideRefs } from "./refs"

const TICK_COUNT = 360 / TICK_STEP

type TickLevel = "major" | "medium" | "minor"

const tickLevel = (angle: number): TickLevel => {
  if (angle % STEP_ANGLE === 0) return "major"
  if (angle % (TICK_STEP * 2) === 0) return "medium"
  return "minor"
}

const snap = (n: number) => Number(n.toFixed(4))

const polar = (angleDeg: number, radius: number) => {
  const rad = (angleDeg * Math.PI) / 180
  return [
    snap(CX + radius * Math.cos(rad)),
    snap(CY + radius * Math.sin(rad)),
  ] as const
}

const TICK = {
  major: {
    inner: INNER_R + 0.06,
    outer: OUTER_R - 0.06,
    width: 0.16,
    opacity: "text-background-1/45",
  },
  medium: {
    inner: INNER_R + 0.5,
    outer: OUTER_R - 0.18,
    width: 0.1,
    opacity: "text-background-1/22",
  },
  minor: {
    inner: INNER_R + 1,
    outer: OUTER_R - 0.32,
    width: 0.07,
    opacity: "text-background-1/10",
  },
} as const

const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
  const angle = i * TICK_STEP
  const level = tickLevel(angle)
  const spec = TICK[level]
  const [x1, y1] = polar(angle, spec.inner)
  const [x2, y2] = polar(angle, spec.outer)
  return {
    angle,
    x1,
    y1,
    x2,
    y2,
    width: spec.width,
    opacity: spec.opacity,
  }
})

// Instrument layers inside the tick channel. All radii are viewBox units.
const SCALE_R = 43.4
const DEGREE_R = 41.9
const MICRO_R = 38.4
const COMB_OUTER_R = 35.6
const COMB_INNER_R = 33.8
const SPOKE_INNER_R = 26
const ORBIT_R = 30.8
const CORE_R = 22.5

const MICRO_TEXT = `${profile.name} · ${profile.role} · ${profile.city}, ${profile.country} · `
const MICRO_C = snap(2 * Math.PI * MICRO_R)

// Full circle from 3 o'clock, drawn clockwise so the text sits upright on
// the outside of the ring.
const circlePath = (r: number) =>
  `M ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY}`

const arcPath = (r: number, fromDeg: number, toDeg: number) => {
  const [x1, y1] = polar(fromDeg, r)
  const [x2, y2] = polar(toDeg, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}

const degreeLabels = Array.from({ length: 360 / STEP_ANGLE }, (_, i) => {
  const angle = i * STEP_ANGLE
  return { angle, text: `${String(angle).padStart(3, "0")}°` }
})

const comb = Array.from({ length: 360 / 6 }, (_, i) => {
  const angle = i * 6
  const spoke = angle % STEP_ANGLE === 0
  const [x1, y1] = polar(angle, spoke ? SPOKE_INNER_R : COMB_INNER_R)
  const [x2, y2] = polar(angle, COMB_OUTER_R)
  return { angle, x1, y1, x2, y2, spoke }
})

// Bracket outside the outer ring that frames the active step at the needle.
const WINDOW_R = OUTER_R + 1.4
const WINDOW_HALF = STEP_ANGLE * 0.2
const windowCaps = [-WINDOW_HALF, WINDOW_HALF].map((angle) => {
  const [x1, y1] = polar(angle, WINDOW_R - 0.7)
  const [x2, y2] = polar(angle, WINDOW_R + 0.5)
  return { angle, x1, y1, x2, y2 }
})

const LAYER = "absolute inset-0 size-full"

type CircleRef = (el: SVGCircleElement | null) => void
type GroupRef = (el: SVGGElement | null) => void
type DivRef = (el: HTMLDivElement | null) => void

export const DialFace = ({
  outerRef,
  innerRef,
  progressRef,
  progressSpinRef,
  tickWheelRef,
  needleRef,
}: {
  outerRef: CircleRef
  innerRef: CircleRef
  progressRef: CircleRef
  progressSpinRef: GroupRef
  tickWheelRef: DivRef
  needleRef: GroupRef
}) => (
  // Every moving layer is its own <svg> transformed as an element, so the
  // browser rasterises it once and the GPU turns it, instead of repainting
  // one big SVG on every scroll frame.
  // The left fade is a page-coloured overlay (last child) rather than a CSS mask:
  // a mask over the spinning layers made the browser re-blend the whole dial every frame.
  <div aria-hidden className="absolute inset-0 text-background-1">
    <svg className={LAYER} viewBox="0 0 100 100" fill="none">
      {/* active-step window */}
      <g className="text-background-1/45">
        <path
          d={arcPath(WINDOW_R, -WINDOW_HALF, WINDOW_HALF)}
          stroke="currentColor"
          strokeWidth="0.12"
        />
        {windowCaps.map((cap) => (
          <line
            key={cap.angle}
            x1={cap.x1}
            y1={cap.y1}
            x2={cap.x2}
            y2={cap.y2}
            stroke="currentColor"
            strokeWidth="0.12"
          />
        ))}
      </g>

      <circle
        ref={outerRef}
        cx={CX}
        cy={CY}
        r={OUTER_R}
        stroke="currentColor"
        strokeWidth="0.11"
        className="text-background-1/18"
      />
      <circle
        ref={innerRef}
        cx={CX}
        cy={CY}
        r={INNER_R}
        stroke="currentColor"
        strokeWidth="0.11"
        className="text-background-1/12"
      />
      <g ref={progressSpinRef}>
        <circle
          ref={progressRef}
          cx={CX}
          cy={CY}
          r={CHANNEL_R}
          stroke="currentColor"
          strokeWidth="0.2"
          strokeLinecap="butt"
          strokeDasharray={`0 ${CHANNEL_C}`}
          className="text-background-1/80"
        />
      </g>
    </svg>

    {/* turns with the scroll */}
    <div ref={tickWheelRef} className="absolute inset-0 will-change-transform">
      <svg className={LAYER} viewBox="0 0 100 100" fill="none">
        <defs>
          <path id="about-dial-micro" d={circlePath(MICRO_R)} />
        </defs>
        {ticks.map((tick) => (
          <line
            key={tick.angle}
            x1={tick.x1.toFixed(4)}
            y1={tick.y1.toFixed(4)}
            x2={tick.x2.toFixed(4)}
            y2={tick.y2.toFixed(4)}
            stroke="currentColor"
            strokeWidth={tick.width}
            strokeLinecap="butt"
            className={tick.opacity}
          />
        ))}

        {/* dotted scale */}
        <circle
          cx={CX}
          cy={CY}
          r={SCALE_R}
          stroke="currentColor"
          strokeWidth="0.2"
          strokeLinecap="round"
          strokeDasharray="0.01 0.74"
          className="text-background-1/25"
        />

        {/* degree readouts, one per step */}
        <g className="fill-background-1/35 text-[1.05px] tracking-[0.04em] tabular-nums">
          {degreeLabels.map((label) => (
            <text
              key={label.angle}
              x={CX + DEGREE_R}
              y={CY}
              textAnchor="end"
              dominantBaseline="central"
              transform={`rotate(${label.angle} ${CX} ${CY})`}
            >
              {label.text}
            </text>
          ))}
        </g>

        <circle
          cx={CX}
          cy={CY}
          r={MICRO_R + 1.5}
          stroke="currentColor"
          strokeWidth="0.08"
          className="text-background-1/10"
        />

        {/* curved microtype */}
        <text
          className="fill-background-1/30 text-[1px] tracking-[0.12em] uppercase"
          textLength={MICRO_C}
          lengthAdjust="spacing"
        >
          <textPath href="#about-dial-micro">{MICRO_TEXT.repeat(4)}</textPath>
        </text>

        {/* inner comb with a spoke on every step */}
        {comb.map((line) => (
          <line
            key={line.angle}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth={line.spoke ? 0.1 : 0.07}
            className={
              line.spoke ? "text-background-1/14" : "text-background-1/10"
            }
          />
        ))}
        <circle
          cx={CX}
          cy={CY}
          r={COMB_OUTER_R}
          stroke="currentColor"
          strokeWidth="0.08"
          className="text-background-1/12"
        />
      </svg>
    </div>

    {/* slow drifting orbits, independent of scroll */}
    <svg
      className={cn(
        LAYER,
        "will-change-transform motion-safe:animate-[spin_90s_linear_infinite]"
      )}
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle
        cx={CX}
        cy={CY}
        r={ORBIT_R}
        stroke="currentColor"
        strokeWidth="0.1"
        strokeDasharray="0.5 1.3"
        className="opacity-25"
      />
      <circle
        cx={CX + ORBIT_R}
        cy={CY}
        r="0.42"
        fill="currentColor"
        className="opacity-60"
      />
    </svg>
    <svg
      className={cn(
        LAYER,
        "will-change-transform motion-safe:animate-[spin_140s_linear_infinite_reverse]"
      )}
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle
        cx={CX}
        cy={CY}
        r={CORE_R}
        stroke="currentColor"
        strokeWidth="0.14"
        strokeDasharray="9 3 1.2 3"
        className="opacity-20"
      />
    </svg>

    <svg className={LAYER} viewBox="0 0 100 100" fill="none">
      {/* needle: a probe from the core out through the channel */}
      <g ref={needleRef} className="opacity-0">
        <line
          x1={CX + CORE_R}
          y1={CY}
          x2={CX + INNER_R - 0.8}
          y2={CY}
          stroke="currentColor"
          strokeWidth="0.08"
          strokeDasharray="0.45 0.55"
          className="opacity-40"
        />
        <circle
          cx={CX + CORE_R}
          cy={CY}
          r="0.7"
          stroke="currentColor"
          strokeWidth="0.12"
          className="opacity-60"
        />
        <path
          d={`M ${CX + INNER_R - 1.5} ${CY} l 0.75 -0.55 l 0 1.1 z`}
          fill="currentColor"
        />
        <line
          x1={CX + INNER_R - 0.2}
          y1={CY}
          x2={CX + OUTER_R + 0.35}
          y2={CY}
          stroke="currentColor"
          strokeWidth="0.34"
          strokeLinecap="round"
        />
        <circle cx={CX + OUTER_R + 0.5} cy={CY} r="0.38" fill="currentColor" />
      </g>
    </svg>

    {/* left fade, same result as the old transparent→black mask */}
    <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-background-2)_36%,transparent_62%)]" />
  </div>
)

export const AboutDial = ({
  wheelRef,
  setSlideRef,
  faceClassName,
  labelClassName,
  ...faceRefs
}: {
  wheelRef: Ref<HTMLDivElement>
  setSlideRef: <K extends keyof SlideRefs>(
    index: number,
    key: K,
    el: SlideRefs[K]
  ) => void
  faceClassName?: string
  labelClassName?: string
  outerRef: CircleRef
  innerRef: CircleRef
  progressRef: CircleRef
  progressSpinRef: GroupRef
  tickWheelRef: DivRef
  needleRef: GroupRef
}) => (
  <>
    <DialFace {...faceRefs} />
    <div ref={wheelRef} className="absolute inset-0">
      {aboutSlides.map((slide, index) => (
        <div
          key={slide.title}
          className="absolute inset-0"
          style={{ transform: `rotate(${index * STEP_ANGLE}deg)` }}
        >
          <span
            ref={(el) => setSlideRef(index, "number", el)}
            className="absolute top-1/2 origin-left -translate-y-1/2 pl-3"
            style={{ left: `calc(50% + ${OUTER_R}%)` }}
          >
            <span
              ref={(el) => setSlideRef(index, "face", el)}
              className={cn(
                "inline-block origin-center font-instrument-serif whitespace-nowrap text-background-1 tabular-nums",
                faceClassName,
                index === 0 ? "opacity-100" : "opacity-15"
              )}
            >
              <span className={cn("inline-block", labelClassName)}>
                {slideNumber(index)}
              </span>
            </span>
          </span>
        </div>
      ))}
    </div>
  </>
)

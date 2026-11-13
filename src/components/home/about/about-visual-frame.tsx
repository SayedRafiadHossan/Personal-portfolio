import { aboutSlides, profile } from "@/data/data"

// Instrument frame drawn behind the about visuals, echoing the left dial.
// Everything here is decorative; the slide visuals sit on top of it.
// Each spinning layer is its own <svg> rotated as an element, so it is
// rasterised once and turned by the GPU instead of repainting every frame.

const C = 50
const RING_R = 48.6
const MICRO_R = 44.6
const ORBIT_R = 40.5

const snap = (n: number) => Number(n.toFixed(3))

const polar = (angleDeg: number, r: number) => {
  const rad = (angleDeg * Math.PI) / 180
  return [snap(C + r * Math.cos(rad)), snap(C + r * Math.sin(rad))] as const
}

const ticks = Array.from({ length: 72 }, (_, i) => {
  const angle = i * 5
  const major = angle % 30 === 0
  const [x1, y1] = polar(angle, major ? RING_R - 2.6 : RING_R - 1.2)
  const [x2, y2] = polar(angle, RING_R)
  return { angle, x1, y1, x2, y2, major }
})

// Clockwise from 3 o'clock so the text sits upright on the outside.
const circlePath = (r: number) =>
  `M ${C + r} ${C} A ${r} ${r} 0 1 1 ${C - r} ${C} A ${r} ${r} 0 1 1 ${C + r} ${C}`

const MICRO_TEXT = `${aboutSlides.map((slide) => slide.title).join(" · ")} · `
const MICRO_C = snap(2 * Math.PI * MICRO_R)

// L-shaped registration marks at the corners of the visual.
const MARK = 3.2
const EDGE = 15.5
const corners = [
  { x: EDGE, y: EDGE, dx: 1, dy: 1 },
  { x: 100 - EDGE, y: EDGE, dx: -1, dy: 1 },
  { x: EDGE, y: 100 - EDGE, dx: 1, dy: -1 },
  { x: 100 - EDGE, y: 100 - EDGE, dx: -1, dy: -1 },
]

const LAYER = "absolute inset-0 size-full overflow-visible"

export const AboutVisualFrame = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute -inset-[22%] text-background-1"
  >
    {/* static: crosshair + registration marks */}
    <svg viewBox="0 0 100 100" fill="none" className={LAYER}>
      <g
        stroke="currentColor"
        strokeWidth="0.08"
        strokeDasharray="0.5 0.7"
        className="opacity-20"
      >
        <line x1="0" y1={C} x2="100" y2={C} />
        <line x1={C} y1="0" x2={C} y2="100" />
      </g>
      <g stroke="currentColor" strokeWidth="0.16" className="opacity-50">
        {corners.map((corner) => (
          <path
            key={`${corner.x}-${corner.y}`}
            d={`M ${corner.x} ${corner.y + MARK * corner.dy} V ${corner.y} H ${corner.x + MARK * corner.dx}`}
          />
        ))}
      </g>
    </svg>

    {/* outer dial, slowly turning */}
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={`${LAYER} will-change-transform motion-safe:animate-[spin_120s_linear_infinite]`}
    >
      <defs>
        <path id="about-visual-micro" d={circlePath(MICRO_R)} />
      </defs>
      <circle
        cx={C}
        cy={C}
        r={RING_R}
        stroke="currentColor"
        strokeWidth="0.1"
        className="opacity-20"
      />
      {ticks.map((tick) => (
        <line
          key={tick.angle}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="currentColor"
          strokeWidth={tick.major ? 0.16 : 0.08}
          className={tick.major ? "opacity-45" : "opacity-20"}
        />
      ))}
      <text
        className="fill-background-1/35 text-[1.15px] tracking-[0.14em] uppercase"
        textLength={MICRO_C}
        lengthAdjust="spacing"
      >
        <textPath href="#about-visual-micro">{MICRO_TEXT.repeat(3)}</textPath>
      </text>
    </svg>

    {/* counter-rotating orbit with a satellite */}
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={`${LAYER} will-change-transform motion-safe:animate-[spin_70s_linear_infinite_reverse]`}
    >
      <circle
        cx={C}
        cy={C}
        r={ORBIT_R}
        stroke="currentColor"
        strokeWidth="0.1"
        strokeDasharray="0.6 1.5"
        className="opacity-30"
      />
      <circle
        cx={C + ORBIT_R}
        cy={C}
        r="0.6"
        fill="currentColor"
        className="opacity-70"
      />
    </svg>

    {/* coordinates of your city, matching the footer */}
    <span className="absolute top-[12%] left-[15.5%] font-aspekta text-tagline-4 tracking-[0.16em] text-background-1/35 uppercase">
      {profile.coordinates.split(", ")[0]}
    </span>
    <span className="absolute top-[12%] right-[15.5%] font-aspekta text-tagline-4 tracking-[0.16em] text-background-1/35 uppercase">
      {profile.coordinates.split(", ")[1]}
    </span>
  </div>
)

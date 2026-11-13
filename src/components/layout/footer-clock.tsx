"use client"

import { profile } from "@/data/data"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const subscribeReducedMotion = (onStoreChange: () => void) => {
  const motionMq = window.matchMedia(REDUCE_MOTION_QUERY)
  motionMq.addEventListener("change", onStoreChange)
  return () => motionMq.removeEventListener("change", onStoreChange)
}

const getReducedMotionSnapshot = () =>
  window.matchMedia(REDUCE_MOTION_QUERY).matches

const getReducedMotionServerSnapshot = () => false

const DHAKA_TZ = profile.timezone

type ZoneTime = {
  hour: number
  minute: number
  second: number
}

const zoneTime = (date: Date): ZoneTime => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return {
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  }
}

const OFFSET_RE = /([+-])(\d{1,2})(?::(\d{2}))?/

const zoneOffsetMinutes = (timeZone: string, date: Date) => {
  const name =
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""

  const match = OFFSET_RE.exec(name)
  if (!match) return 360
  const sign = match[1] === "-" ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

const greetingFor = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Morning"
  if (hour >= 12 && hour < 17) return "Afternoon"
  if (hour >= 17 && hour < 21) return "Evening"
  return "Night"
}

const offsetLabel = (date: Date) => {
  const dhaka = zoneOffsetMinutes(DHAKA_TZ, date)
  const local = -date.getTimezoneOffset()
  const hours = (dhaka - local) / 60
  if (hours === 0) return null
  const abs = Math.abs(hours)
  const value = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  return hours > 0 ? `${value}h ahead` : `${value}h behind`
}

const pad = (n: number) => String(n).padStart(2, "0")

const AnalogFace = ({ hour, minute, second }: ZoneTime) => {
  const hourAngle = ((hour % 12) + minute / 60) * 30
  const minuteAngle = (minute + second / 60) * 6
  const secondAngle = second * 6

  return (
    <svg
      viewBox="0 0 64 64"
      className="size-full text-background-2"
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="30.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        className="opacity-20"
      />
      <circle
        cx="32"
        cy="32"
        r="23.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
        className="opacity-10"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="32"
          y1="5"
          x2="32"
          y2={i % 3 === 0 ? "9.5" : "7.5"}
          stroke="currentColor"
          strokeWidth={i % 3 === 0 ? 1.15 : 0.55}
          strokeLinecap="round"
          className={i % 3 === 0 ? "opacity-45" : "opacity-18"}
          transform={`rotate(${i * 30} 32 32)`}
        />
      ))}
      <line
        x1="32"
        y1="32"
        x2="32"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="opacity-70"
        transform={`rotate(${hourAngle} 32 32)`}
      />
      <line
        x1="32"
        y1="32"
        x2="32"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        className="opacity-55"
        transform={`rotate(${minuteAngle} 32 32)`}
      />
      <line
        x1="32"
        y1="34.5"
        x2="32"
        y2="8"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinecap="round"
        className="opacity-35"
        transform={`rotate(${secondAngle} 32 32)`}
      />
      <circle
        cx="32"
        cy="32"
        r="1.45"
        fill="currentColor"
        className="opacity-80"
      />
    </svg>
  )
}

export const FooterClock = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState<Date | null>(null)
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  useEffect(() => {
    const root = rootRef.current

    let interval = 0
    let visible = false

    const start = () => {
      setNow(new Date())
      if (interval) return
      interval = window.setInterval(() => setNow(new Date()), 1000)
    }

    const stop = () => {
      window.clearInterval(interval)
      interval = 0
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !document.hidden) start()
        else stop()
      },
      { rootMargin: "80px" }
    )

    if (root) observer.observe(root)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const time = now ? zoneTime(now) : { hour: 0, minute: 0, second: 0 }
  const ready = now !== null
  const colonDim = ready && !reduceMotion && time.second % 2 === 1
  const hour12 = time.hour % 12 || 12
  const meridiem = time.hour < 12 ? "AM" : "PM"

  return (
    <div
      ref={rootRef}
      className="flex w-full items-center justify-center gap-6"
    >
      <span
        aria-hidden
        className="hidden h-px min-w-0 flex-1 bg-linear-to-r from-transparent from-5% to-[#9ec9c0]/30 md:block"
      />
      <div className="flex shrink-0 flex-col items-center gap-5 text-center md:flex-row md:gap-4 md:text-left">
        <div className="size-11 md:size-12">
          {ready ? <AnalogFace {...time} /> : null}
        </div>
        <div className="flex flex-col items-center gap-2 md:items-start">
          <time
            dateTime={now?.toISOString()}
            aria-label={
              ready
                ? `Local time in ${profile.city}, ${hour12}:${pad(time.minute)} ${meridiem}`
                : `Local time in ${profile.city}`
            }
            className="font-instrument-serif text-[1.75rem] leading-none text-background-2/55 italic tabular-nums md:text-instrument-heading-5"
          >
            <span>{ready ? hour12 : "––"}</span>
            <span
              className="inline-block w-[0.28em] text-center"
              style={{ opacity: colonDim ? 0.2 : 1 }}
            >
              :
            </span>
            <span>{ready ? pad(time.minute) : "––"}</span>
            <span className="ml-[0.25em]">
              {ready ? meridiem : ""}
            </span>
          </time>
          <p className="font-aspekta-400 text-tagline-4 tracking-[0.12em] text-background-2/35 uppercase">
            {ready
              ? [`${greetingFor(time.hour)} in ${profile.city}`, offsetLabel(now)]
                  .filter(Boolean)
                  .join(" · ")
              : `${profile.city} · UTC+6`}
          </p>
        </div>
      </div>
      <span
        aria-hidden
        className="hidden h-px min-w-0 flex-1 bg-linear-to-l from-transparent from-5% to-[#9ec9c0]/30 md:block"
      />
    </div>
  )
}

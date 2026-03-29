import { useRef, useLayoutEffect, useMemo } from "react"
import { MonetizationOn } from "@mui/icons-material"
import gsap from "gsap"

const BUBBLE_COUNT = 88

const makeSeeds = (n) =>
  Array.from({ length: n }, () => ({
    leftPct: Math.random() * 90 + 5,
    scale: 0.82 + Math.random() * 0.38,
    duration: 14 + Math.random() * 18,
    drift: 8 + Math.random() * 16,
    tilt: 4 + Math.random() * 10,
    peakOpacity: 0.24 + Math.random() * 0.22,
    phase: Math.random() * 0.97,
  }))

const Background = () => {
  const rootRef = useRef(null)
  const seeds = useMemo(() => makeSeeds(BUBBLE_COUNT), [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const ctx = gsap.context(() => {
      const bubbles = root.querySelectorAll(".bg-bubble")

      bubbles.forEach((el, i) => {
        const s = seeds[i]
        const d = reduceMotion ? 0.01 : s.duration

        if (reduceMotion) {
          gsap.set(el, {
            opacity: s.peakOpacity * 0.6,
            y: `${(0.35 - s.phase) * 90}vh`,
            x: (s.phase - 0.5) * s.drift * 1.5,
          })
          return
        }

        const below = {
          y: "28vh",
          x: -s.drift,
          opacity: 0,
          rotation: -s.tilt * 0.35,
        }

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 })

        tl.set(el, below)

        tl.to(el, {
          opacity: s.peakOpacity,
          duration: d * 0.08,
          ease: "power2.out",
        })

        tl.to(
          el,
          {
            y: "-128vh",
            x: s.drift,
            rotation: s.tilt * 0.35,
            duration: d * 0.78,
            ease: "sine.inOut",
          },
          "<0.02"
        )

        tl.to(
          el,
          { opacity: 0, duration: d * 0.16, ease: "power2.in" },
          `-=${d * 0.2}`
        )

        tl.progress(s.phase, false)
      })
    }, root)

    return () => ctx.revert()
  }, [seeds])

  return (
    <div id="background" ref={rootRef} aria-hidden>
      {seeds.map((s, i) => (
        <div key={i} className="bg-bubble" style={{ left: `${s.leftPct}%` }}>
          <MonetizationOn sx={{ fontSize: `${40 * s.scale}px` }} />
        </div>
      ))}
    </div>
  )
}

export default Background

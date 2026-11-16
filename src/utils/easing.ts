export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

/** Smoothstep 0 → 1. */
export function ease(value: number): number {
  const x = clamp(value)
  return x * x * (3 - 2 * x)
}

/** A single 0 → 1 → 0 hump that starts at `start` and lasts `duration`. */
export function pulse(time: number, start: number, duration: number): number {
  const progress = (time - start) / duration
  return progress > 0 && progress < 1 ? Math.sin(Math.PI * progress) : 0
}

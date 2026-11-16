import type { VoiceLine } from '../types/episode/episode.types'

const SYLLABLES_PER_SECOND = 3.4
const EDGE_FADE_SECONDS = 0.08

/** Syllable-like 0–1 flapping while `line` is being spoken, 0 otherwise. */
export function getTalkAmount(line: VoiceLine, seconds: number): number {
  const start = line.startInSeconds
  const end = start + line.durationInSeconds
  if (seconds < start || seconds > end) {
    return 0
  }
  const local = seconds - start
  const envelope = Math.min(1, local / EDGE_FADE_SECONDS, (end - seconds) / EDGE_FADE_SECONDS)
  const syllable = Math.abs(Math.sin(2 * Math.PI * SYLLABLES_PER_SECOND * local))
  const phrase = 0.65 + 0.35 * Math.sin(2 * Math.PI * 1.3 * local)
  return envelope * syllable * phrase
}

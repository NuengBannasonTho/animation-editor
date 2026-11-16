export type Vector2 = readonly [number, number]

/** Speaker of a voice line. */
export type Speaker = 'man' | 'cat'

/**
 * A soft local deformation of the scene drawing, in source-image pixels.
 * Everything near `center` (falling off with `sigma`) is moved by `offset`
 * and stretched vertically around the centre by `stretchY` (0.5 = 50% taller).
 */
export type Bump = {
  center: Vector2
  sigma: Vector2
  offset: Vector2
  stretchY?: number
}

/** Virtual camera. Centre is a 0–1 fraction of the image, zoom 1 = whole image. */
export type Camera = {
  centerX: number
  centerY: number
  zoom: number
}

/** Where a line lives inside a longer voice file. */
export type VoiceClip = {
  /** Path under `public/`, e.g. `episodes/ep01/voice/man.mp3`. */
  src: string
  /** Second in that file at which this line starts. */
  trimStartInSeconds: number
}

export type VoiceLine = {
  id: string
  speaker: Speaker
  text: string
  /** Start, relative to the start of the scene. */
  startInSeconds: number
  durationInSeconds: number
  /** Omit until the voice file exists — the mouth still animates on the timing above. */
  audio?: VoiceClip
}

export type SceneTime = {
  /** Scene time quantised "on twos" — use for character acting. */
  steppedSeconds: number
  /** Continuous scene time — use for camera moves. */
  seconds: number
  durationInSeconds: number
  /** 0–1 mouth/energy amount for a line at the stepped time (0 when not speaking). */
  talk: (lineId: string) => number
  line: (lineId: string) => VoiceLine
}

export type ScenePose = {
  bumps: Bump[]
  camera: Camera
}

export type SceneConfig = {
  id: string
  /** Start frame, path under `public/`. */
  image: string
  durationInSeconds: number
  lines: VoiceLine[]
  pose: (time: SceneTime) => ScenePose
}

export type MusicTrack = {
  src: string
  volume: number
}

export type EpisodeConfig = {
  id: string
  title: string
  fps: number
  width: number
  height: number
  music?: MusicTrack
  scenes: SceneConfig[]
}

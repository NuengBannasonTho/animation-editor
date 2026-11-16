import type { EpisodeConfig, SceneConfig } from '../../types/episode/episode.types'
import { clamp, ease, pulse } from '../../utils/easing'

/**
 * EVERYDAY CHAOS — EP.01 "The Cat Bed Disaster"
 *
 * Voice lines: timings below are estimates. Once the voice files exist, put them in
 * `public/episodes/ep01/voice/`, run `npm run detect-lines -- <file>` to find where each
 * line starts, then set `durationInSeconds` and add e.g.
 *   audio: { src: 'episodes/ep01/voice/man.mp3', trimStartInSeconds: 0.12 }
 * to each line. Mouths and gestures follow the line timing automatically.
 *
 * Bump coordinates are pixels in the 941×1672 scene drawings.
 */

const ASSET_DIR = 'episodes/ep01'

const SCENE_GIFT: SceneConfig = {
  id: 'ep01-scene-1-gift',
  image: `${ASSET_DIR}/scene-1.png`,
  durationInSeconds: 5,
  lines: [
    {
      id: 'gift',
      speaker: 'man',
      text: 'ดูนี่! เตียงใหม่ของแก นุ่มสุด ๆ เลยนะ!',
      startInSeconds: 0.4,
      durationInSeconds: 3.0,
    },
  ],
  pose: ({ steppedSeconds: t, seconds, durationInSeconds, talk, line }) => {
    const amount = talk('gift')
    const isTalking = amount > 0
    const lineEnd = line('gift').startInSeconds + line('gift').durationInSeconds
    const glance = ease((t - lineEnd - 0.2) / 0.4)
    return {
      bumps: [
        // Man bounces and presents the bed while talking.
        { center: [250, 800], sigma: [230, 280], offset: [0, -7 * amount] },
        { center: [312, 778], sigma: [42, 48], offset: [0, 0], stretchY: 0.55 * amount - (isTalking ? 0.2 : 0) },
        { center: [430, 900], sigma: [80, 60], offset: [isTalking ? 6 * Math.sin(t * 5) : 0, -5 * amount] },
        // Cat: slow blink, unimpressed side glance, one tail flick.
        { center: [760, 1000], sigma: [140, 120], offset: [-7 * glance, 3 * glance] },
        { center: [765, 985], sigma: [120, 26], offset: [0, 0], stretchY: -0.5 * pulse(t, lineEnd + 0.1, 0.35) },
        {
          center: [890, 1255],
          sigma: [60, 60],
          offset: [12 * pulse(t, lineEnd + 0.8, 0.4), -6 * pulse(t, lineEnd + 0.8, 0.4)],
        },
      ],
      camera: { centerX: 0.5, centerY: 0.55, zoom: 1.03 + (0.05 * seconds) / durationInSeconds },
    }
  },
}

const SCENE_CHOICE: SceneConfig = {
  id: 'ep01-scene-2-choice',
  image: `${ASSET_DIR}/scene-2.png`,
  durationInSeconds: 4,
  lines: [
    {
      id: 'choice',
      speaker: 'cat',
      text: 'อืม... กล่องนี้แหละ ใช่เลย',
      startInSeconds: 0.9,
      durationInSeconds: 2.4,
    },
  ],
  pose: ({ steppedSeconds: t, seconds, durationInSeconds, talk, line }) => {
    const amount = talk('choice')
    const settle = Math.exp(-t * 2.2) * Math.sin(t * 14)
    const chinLift = ease((t - line('choice').startInSeconds + 0.1) / 0.5)
    const push = ease(seconds / durationInSeconds)
    return {
      bumps: [
        // Cat settles into the box, lifts its chin and nods on each word.
        { center: [690, 1080], sigma: [190, 180], offset: [7 * settle, 0] },
        { center: [690, 1010], sigma: [150, 120], offset: [0, -8 * chinLift - 3 * amount] },
        { center: [690, 1040], sigma: [30, 22], offset: [0, 0], stretchY: 0.9 * amount },
        { center: [700, 1290], sigma: [240, 70], offset: [0, 4 + 3 * settle] },
        // Man scratches his head, confused.
        { center: [245, 500], sigma: [60, 60], offset: [7 * Math.sin(t * 16), 0] },
        { center: [400, 560], sigma: [150, 150], offset: [6 * Math.sin(t * 2.2), 0] },
        { center: [440, 610], sigma: [22, 22], offset: [0, 0], stretchY: 0.35 * Math.abs(Math.sin(t * 3)) },
      ],
      camera: { centerX: 0.5 + 0.12 * push, centerY: 0.5 + 0.1 * push, zoom: 1.03 + 0.2 * push },
    }
  },
}

const SCENE_CONFUSION: SceneConfig = {
  id: 'ep01-scene-3-confusion',
  image: `${ASSET_DIR}/scene-3.png`,
  durationInSeconds: 5,
  lines: [
    {
      id: 'confusion',
      speaker: 'man',
      text: 'ห๊ะ!? ซื้อเตียงให้ แต่แกเลือกกล่องเนี่ยนะ!?',
      startInSeconds: 0.4,
      durationInSeconds: 3.5,
    },
  ],
  pose: ({ steppedSeconds: t, seconds, talk, line }) => {
    const amount = talk('confusion')
    const isTalking = amount > 0
    const start = line('confusion').startInSeconds
    const end = start + line('confusion').durationInSeconds
    const progress = clamp((t - start) / (end - start))
    const punchIn = ease((seconds - start) / 0.18)
    const pullBack = ease((seconds - end + 0.2) / 0.5)
    return {
      bumps: [
        { center: [300, 760], sigma: [260, 250], offset: [0, -8 * amount] },
        { center: [352, 828], sigma: [60, 70], offset: [0, 0], stretchY: 0.35 * amount - (isTalking ? 0.25 : 0) },
        // Points at the bed, then at the box.
        { center: [270, 1090], sigma: [80, 80], offset: [0, 10 * pulse(progress, 0.25, 0.3)] },
        { center: [520, 965], sigma: [90, 60], offset: [12 * pulse(progress, 0.6, 0.3), 0] },
        // Cat turns its eyes to him and blinks once.
        { center: [740, 1010], sigma: [150, 120], offset: [-6 * ease((t - end - 0.1) / 0.4), 0] },
        { center: [745, 1000], sigma: [130, 26], offset: [0, 0], stretchY: -0.5 * pulse(t, end + 0.5, 0.3) },
      ],
      camera: { centerX: 0.42, centerY: 0.5, zoom: 1.03 + 0.27 * punchIn - 0.2 * pullBack },
    }
  },
}

const SCENE_PROFESSOR: SceneConfig = {
  id: 'ep01-scene-4-professor',
  image: `${ASSET_DIR}/scene-4.png`,
  durationInSeconds: 6,
  lines: [
    {
      id: 'lesson',
      speaker: 'cat',
      text: 'กล่องมันอุ่น ปลอดภัย แถมซ่อนตัวได้ เข้าใจยัง?',
      startInSeconds: 0.5,
      durationInSeconds: 4.4,
    },
  ],
  pose: ({ steppedSeconds: t, seconds, durationInSeconds, talk, line }) => {
    const amount = talk('lesson')
    const isTalking = amount > 0
    const start = line('lesson').startInSeconds
    const end = start + line('lesson').durationInSeconds
    const pawGesture = pulse(t, start + 0.5, 0.5) + pulse(t, start + (end - start) * 0.55, 0.5)
    const nod = pulse(t, end - 0.2, 0.45) + pulse(t, end + 0.35, 0.45)
    return {
      bumps: [
        { center: [700, 960], sigma: [170, 150], offset: [0, -3 * amount] },
        { center: [688, 990], sigma: [34, 36], offset: [0, 0], stretchY: 0.6 * amount - (isTalking ? 0.3 : 0) },
        // Professor paw: two small explanatory gestures.
        { center: [478, 925], sigma: [75, 85], offset: [0, -12 * pawGesture] },
        // Man nods twice once he gets it.
        { center: [270, 740], sigma: [220, 200], offset: [0, 11 * nod] },
        { center: [345, 835], sigma: [22, 22], offset: [0, 0], stretchY: -0.4 * ease((t - end + 0.6) / 0.6) },
      ],
      camera: { centerX: 0.58, centerY: 0.54, zoom: 1.05 + 0.13 * ease(seconds / durationInSeconds) },
    }
  },
}

const SCENE_TWIST: SceneConfig = {
  id: 'ep01-scene-5-twist',
  image: `${ASSET_DIR}/scene-5.png`,
  durationInSeconds: 7,
  lines: [
    {
      id: 'warm',
      speaker: 'man',
      text: 'เออ! อุ่นจริงด้วย!',
      startInSeconds: 0.7,
      durationInSeconds: 1.4,
    },
    {
      id: 'punchline',
      speaker: 'cat',
      text: 'นี่ฉันเลี้ยงคนหรือแมวเนี่ย...',
      startInSeconds: 4.2,
      durationInSeconds: 2.0,
    },
  ],
  pose: ({ steppedSeconds: t, seconds, talk, line }) => {
    const manAmount = talk('warm')
    const catAmount = talk('punchline')
    const catStart = line('punchline').startInSeconds
    const wiggle = Math.sin(t * 13) * clamp(1 - t / 1.3)
    const closeIn = ease((seconds - catStart + 0.2) / 1.6)
    return {
      bumps: [
        // Man wiggles happily in his box.
        { center: [270, 1010], sigma: [230, 190], offset: [7 * wiggle, 0] },
        { center: [270, 860], sigma: [200, 170], offset: [0, -6 * manAmount] },
        { center: [330, 885], sigma: [26, 20], offset: [0, 0], stretchY: 1.2 * manAmount },
        { center: [280, 1230], sigma: [260, 70], offset: [0, 3 + 2 * wiggle] },
        // Cat turns, sighs, then delivers the line.
        {
          center: [720, 1040],
          sigma: [150, 130],
          offset: [-9 * ease((t - catStart + 1.3) / 0.5), 7 * pulse(t, catStart - 0.7, 0.55) - 3 * catAmount],
        },
        { center: [735, 1085], sigma: [26, 20], offset: [0, 0], stretchY: 1.0 * catAmount },
      ],
      camera: { centerX: 0.5 + 0.26 * closeIn, centerY: 0.5 + 0.13 * closeIn, zoom: 1.03 + 0.6 * closeIn },
    }
  },
}

export const EP01: EpisodeConfig = {
  id: 'ep01',
  title: 'EVERYDAY CHAOS EP.01 — The Cat Bed Disaster',
  fps: 24,
  width: 1080,
  height: 1920,
  music: { src: `${ASSET_DIR}/music.wav`, volume: 0.35 },
  scenes: [SCENE_GIFT, SCENE_CHOICE, SCENE_CONFUSION, SCENE_PROFESSOR, SCENE_TWIST],
}

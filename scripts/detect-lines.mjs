// Prints where each spoken line starts/ends inside a voice file, by finding the pauses.
// Usage: npm run detect-lines -- public/episodes/ep01/voice/man.mp3 [minPauseSeconds]
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const [file, minPause = '0.4'] = process.argv.slice(2)
if (!file || !existsSync(file)) {
  console.error('Usage: npm run detect-lines -- <audio file> [minPauseSeconds]')
  process.exit(1)
}

const result = spawnSync(
  'npx',
  ['remotion', 'ffmpeg', '-hide_banner', '-i', file, '-af', `silencedetect=noise=-38dB:d=${minPause}`, '-f', 'null', '-'],
  { encoding: 'utf8', shell: process.platform === 'win32' },
)
const log = `${result.stdout ?? ''}${result.stderr ?? ''}`
const total = /Duration: (\d+):(\d+):([\d.]+)/.exec(log)
if (!total) {
  console.error(log)
  console.error('Could not read the audio duration.')
  process.exit(1)
}
const totalSeconds = Number(total[1]) * 3600 + Number(total[2]) * 60 + Number(total[3])
const silenceStarts = [...log.matchAll(/silence_start: (-?[\d.]+)/g)].map((match) => Math.max(0, Number(match[1])))
const silenceEnds = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((match) => Number(match[1]))

let cursor = 0
const lines = []
silenceStarts.forEach((silenceStart, index) => {
  if (silenceStart - cursor > 0.15) {
    lines.push({ start: cursor, end: silenceStart })
  }
  cursor = silenceEnds[index] ?? totalSeconds
})
if (totalSeconds - cursor > 0.15) {
  lines.push({ start: cursor, end: totalSeconds })
}

console.log(`${file} — ${totalSeconds.toFixed(2)}s, ${lines.length} spoken segment(s):`)
lines.forEach((line, index) => {
  console.log(
    `  line ${index + 1}: trimStartInSeconds: ${line.start.toFixed(2)}, durationInSeconds: ${(line.end - line.start).toFixed(2)}`,
  )
})

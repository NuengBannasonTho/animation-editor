import { useMemo } from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import type { SceneConfig, SceneTime, VoiceLine } from '../types/episode/episode.types'
import { getTalkAmount } from '../utils/talk'
import { WarpedImage } from './warped-image'

/** Characters move every 2nd frame ("on twos"); outlines re-wobble every 3rd. */
const ACTING_FRAME_STEP = 2
const BOIL_FRAME_STEP = 3

type SceneShotProps = {
  scene: SceneConfig
}

function getLine(scene: SceneConfig, lineId: string): VoiceLine {
  const line = scene.lines.find((candidate) => candidate.id === lineId)
  if (!line) {
    throw new Error(`Scene "${scene.id}" has no voice line "${lineId}"`)
  }
  return line
}

export function SceneShot({ scene }: SceneShotProps) {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const pose = useMemo(() => {
    const steppedSeconds = (Math.floor(frame / ACTING_FRAME_STEP) * ACTING_FRAME_STEP) / fps
    const time: SceneTime = {
      steppedSeconds,
      seconds: frame / fps,
      durationInSeconds: scene.durationInSeconds,
      talk: (lineId) => getTalkAmount(getLine(scene, lineId), steppedSeconds),
      line: (lineId) => getLine(scene, lineId),
    }
    return scene.pose(time)
  }, [frame, fps, scene])

  return (
    <AbsoluteFill style={{ backgroundColor: '#fbf6ea' }}>
      <WarpedImage
        src={scene.image}
        width={width}
        height={height}
        bumps={pose.bumps}
        camera={pose.camera}
        boilSeed={`${scene.id}-${Math.floor(frame / BOIL_FRAME_STEP)}`}
      />
    </AbsoluteFill>
  )
}

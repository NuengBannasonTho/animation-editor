import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion'
import { getEpisode } from '../episodes'
import { SceneShot } from './scene-shot'

export type EpisodeVideoProps = {
  episodeId: string
}

export function EpisodeVideo({ episodeId }: EpisodeVideoProps) {
  const { fps } = useVideoConfig()
  const episode = getEpisode(episodeId)

  let sceneStartFrame = 0
  const timeline = episode.scenes.map((scene) => {
    const startFrame = sceneStartFrame
    const durationInFrames = Math.round(scene.durationInSeconds * fps)
    sceneStartFrame += durationInFrames
    return { scene, startFrame, durationInFrames }
  })

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {episode.music ? <Audio src={staticFile(episode.music.src)} volume={episode.music.volume} /> : null}

      {timeline.map(({ scene, startFrame, durationInFrames }) => (
        <Sequence key={scene.id} name={scene.id} from={startFrame} durationInFrames={durationInFrames}>
          <SceneShot scene={scene} />
        </Sequence>
      ))}

      {timeline.flatMap(({ scene, startFrame }) =>
        scene.lines.map((line) =>
          line.audio ? (
            <Sequence
              key={`${scene.id}-${line.id}`}
              name={`${line.speaker}: ${line.text}`}
              from={startFrame + Math.round(line.startInSeconds * fps)}
              durationInFrames={Math.max(1, Math.round(line.durationInSeconds * fps))}
              layout="none"
            >
              <Audio src={staticFile(line.audio.src)} trimBefore={Math.round(line.audio.trimStartInSeconds * fps)} />
            </Sequence>
          ) : null,
        ),
      )}
    </AbsoluteFill>
  )
}

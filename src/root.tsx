import { Composition } from 'remotion'
import { EpisodeVideo } from './components/episode-video'
import { EPISODE_LIST, getEpisodeDurationInFrames } from './episodes'

export function RemotionRoot() {
  return (
    <>
      {EPISODE_LIST.map((episode) => (
        <Composition
          key={episode.id}
          id={episode.id}
          component={EpisodeVideo}
          defaultProps={{ episodeId: episode.id }}
          durationInFrames={getEpisodeDurationInFrames(episode)}
          fps={episode.fps}
          width={episode.width}
          height={episode.height}
        />
      ))}
    </>
  )
}

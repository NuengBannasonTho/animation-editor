import type { EpisodeConfig } from '../types/episode/episode.types'
import { EP01 } from './ep01/ep01.config'

/** Add new episodes here — each one becomes a composition in Remotion Studio. */
export const EPISODE_LIST: readonly EpisodeConfig[] = [EP01]

export function getEpisode(episodeId: string): EpisodeConfig {
  const episode = EPISODE_LIST.find((candidate) => candidate.id === episodeId)
  if (!episode) {
    throw new Error(`Unknown episode "${episodeId}"`)
  }
  return episode
}

export function getEpisodeDurationInFrames(episode: EpisodeConfig): number {
  return episode.scenes.reduce((total, scene) => total + Math.round(scene.durationInSeconds * episode.fps), 0)
}

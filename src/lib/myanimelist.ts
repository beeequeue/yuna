import request from 'superagent/superagent'
import { fetchSeasonFromEpisode } from '@/lib/crunchyroll'
import { Episode } from '@/types'

const corsAnywhere = 'https://cors-anywhere.herokuapp.com/'

export const fetchEpisodesOfSeries = async (
  id: string | number,
): Promise<Episode[]> => {
  const episodeResponse = await request.get(
    `https://api.jikan.moe/v3/anime/${id}/episodes`,
  )

  const response = await request.get(
    corsAnywhere + episodeResponse.body.episodes[0].video_url,
  )

  const match = /"provider_episode_id":\s?(\d+)/m.exec(response.text)

  if (!match || !match[1]) {
    // tslint:disable-next-line:no-console quotemark
    console.error("Couldn't find media_id for " + id)

    return []
  }

  return fetchSeasonFromEpisode(match[1])
}

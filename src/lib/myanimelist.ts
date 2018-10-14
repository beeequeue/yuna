import request from 'superagent/superagent'
import { fetchSeasonFromEpisode } from '@/lib/crunchyroll'
import { RequestResponse, responseIsError } from '@/utils'
import { Episode } from '@/types'

const corsAnywhere = 'https://cors-anywhere.herokuapp.com/'

export const fetchEpisodesOfSeries = async (
  id: string | number,
): Promise<Episode[]> => {
  const episodeResponse = (await request
    .get(`https://api.jikan.moe/v3/anime/${id}/episodes`)
    .ok(() => true)) as RequestResponse

  if (responseIsError(episodeResponse)) {
    if (episodeResponse.status === 404) {
      return []
    }

    if (episodeResponse.status === 429) {
      return Promise.reject('Too many requests, try again later.')
    }

    return Promise.reject('Something went wrong!')
  }

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

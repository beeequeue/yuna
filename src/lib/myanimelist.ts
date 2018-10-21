import request from 'superagent/superagent'

import { fetchSeasonFromEpisode } from '@/lib/crunchyroll'
import { Episode } from '@/types'
import { RequestResponse, responseIsError } from '@/utils'

const CRUNCHYROLL_PROVIDER_ID = '1'

export const fetchEpisodesOfSeries = async (
  id: string | number,
): Promise<Episode[]> => {
  const baseUrl = `https://myanimelist.net/anime/${id}`
  const episodeResponse = (await request
    .get(baseUrl)
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

  const episodesLinkMatch = episodeResponse.text.match(
    `(${baseUrl}\/.*\/episode)`,
  )
  if (!episodesLinkMatch || !episodesLinkMatch[1]) {
    return []
  }

  const videoUrl = episodesLinkMatch[0] + '/1'
  const response = await request.get(videoUrl)

  const providerMatch = /"provider_id":(\d)/m.exec(response.text)
  if (!providerMatch || providerMatch[1] !== CRUNCHYROLL_PROVIDER_ID) {
    return []
  }

  const mediaIdMatch = /"provider_episode_id":\s?(\d+)/m.exec(response.text)
  if (!mediaIdMatch || !mediaIdMatch[1]) {
    // tslint:disable-next-line:no-console quotemark
    console.error("Couldn't find media_id for " + id)

    return []
  }

  return fetchSeasonFromEpisode(mediaIdMatch[1])
}

import Bottleneck from "bottleneck"
import request from "superagent/dist/superagent"
import { captureException } from "@sentry/browser"

import { EpisodeListEpisodes } from "@/graphql/generated/types"

import { Crunchyroll } from "@/lib/crunchyroll"
import { isNil, RequestResponse, responseIsError, T } from "@/utils"

const baseUrl = `https://myanimelist.net/anime`
const CRUNCHYROLL_PROVIDER_ID = "1"

const malLimiter = new Bottleneck({
  maxConcurrent: 2,
  reservoir: 2,
  reservoirRefreshAmount: 2,
  reservoirRefreshInterval: 2 * 1000,
  minTime: 350,
})

const jikanLimiter = new Bottleneck({
  reservoir: 4,
  reservoirRefreshAmount: 4,
  reservoirRefreshInterval: 5 * 1000,
  minTime: 250,
})

const _request = async <B extends {} = any>(
  url: string,
): Promise<RequestResponse<B>> =>
  request.get(url).ok(T) as Promise<RequestResponse<B>>

const requestLimited = (url: string) => malLimiter.schedule(() => _request(url))

const handleError = (
  response: RequestResponse | null,
  message?: string,
): any => {
  if (response && response.status === 404) {
    return []
  }

  if (response && response.status === 429) {
    return Promise.reject("Too many requests, try again later.")
  }

  return Promise.reject(message || "Something went wrong!")
}

export const fetchEpisodesOfSeries = async (
  id: number,
  idMal: number,
): Promise<EpisodeListEpisodes[]> => {
  const episodeResponse = await requestLimited(`${baseUrl}/${idMal}`)

  if (responseIsError(episodeResponse)) {
    return handleError(episodeResponse)
  }

  const episodesLinkMatch = episodeResponse.text.match(
    /(https:\/\/.*anime\/\d+.*\/episode)/,
  )
  if (!episodesLinkMatch || !episodesLinkMatch[1]) {
    return []
  }

  const videoUrl = episodesLinkMatch[0] + "/1"
  const response = await requestLimited(videoUrl)

  if (responseIsError(response)) {
    return handleError(response)
  }

  const providerMatch = /"provider_id":(\d)/m.exec(response.text)
  if (!providerMatch || providerMatch[1] !== CRUNCHYROLL_PROVIDER_ID) {
    return []
  }

  const mediaIdMatch = /"provider_episode_id":\s?(\d+)/m.exec(response.text)
  if (!mediaIdMatch || !mediaIdMatch[1]) {
    // eslint-disable-next-line no-console
    console.error(`Couldn't find media_id for ${idMal}`)

    return []
  }

  return Crunchyroll.fetchSeasonFromEpisode(id, mediaIdMatch[1])
}

export const fetchRating = async (
  id: string | number,
): Promise<number | null> => {
  let response: RequestResponse<{ score: string | null }> | null = null

  try {
    response = (await jikanLimiter.schedule(() =>
      request.get(`https://api.jikan.moe/v3/anime/${id}`),
    )) as any
  } catch (e) {
    // noop
  }

  if (isNil(response) || responseIsError(response)) {
    captureException(new Error(`Could not fetch MAL rating for MAL:${id}`))
    return null
  }

  const { score } = response.body

  return Number(score)
}

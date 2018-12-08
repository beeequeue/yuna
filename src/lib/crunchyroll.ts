/* tslint:disable:class-name */
import { T } from 'rambdax'
import superagent from 'superagent/superagent'
import uuid from 'uuid/v4'

import { userStore } from '@/lib/user'
import { Episode, Stream } from '@/types'
import { RequestError, RequestSuccess } from '@/utils'

const CR_UNBLOCKER_URL = 'api2.cr-unblocker.com'
const API_URL = 'api.crunchyroll.com'
const VERSION = '0'
const locale = 'enUS'
// tslint:disable-next-line:variable-name
const device_type = 'com.crunchyroll.windows.desktop'
// tslint:disable-next-line:variable-name
const access_token = process.env.VUE_APP_ACCESS_TOKEN

export interface User {
  class: 'user'
  user_id: number
  etp_guid: string
  username: string
  email: string
  first_name: string
  last_name: string
  premium?: string
  is_publisher: false
  access_type: 'premium' | string
  created: string
}

export interface _ImageSet {
  thumb_url: string
  small_url: string
  medium_url: string
  large_url: string
  full_url: string
  wide_url: string
  widestar_url: string
  fwide_url: string
  fwidestar_url: string
  width: string
  height: string
}

export interface _StreamData {
  hardsub_lang: string
  audio_lang: string
  format: 'hls'
  streams: _Stream[]
}

export interface _Stream {
  quality: 'adaptive' | 'low' | 'mid' | 'high' | 'ultra'
  expires: string
  url: string
}

export interface _Media {
  class: string
  media_id: string
  etp_guid: string
  collection_id: string
  collection_etp_guid: string
  series_id: string
  series_name: string
  series_etp_guid: string
  media_type: string
  episode_number: string
  duration: number
  name: string
  description: string
  screenshot_image: _ImageSet
  bif_url: string
  url: string
  clip: boolean
  available: boolean
  premium_available: boolean
  free_available: boolean
  availability_notes: string
  available_time: string
  unavailable_time: string
  premium_available_time: string
  premium_unavailable_time: string
  free_available_time: string
  free_unavailable_time: string
  created: string
  playhead: number
}

export interface _Series {
  class: 'series'
  media_type: 'anime'
  series_id: string
  etp_guid: string
  name: string
  description: string
  url: string
  media_count: number
  landscape_image: _ImageSet
  portrait_image: _ImageSet
}

export interface _QueueEntry {
  last_watched_media: _Media
  most_likely_media: _Media
  ordering: number
  queue_entry_id: number
  last_watched_media_playhead: number
  most_likely_media_playhead: number
  playhead: number
  series: _Series
}

interface CrunchyrollSuccess<D extends object = any> {
  code: 'ok'
  error: false
  data: D
}

interface CrunchyrollError {
  code: 'bad_request' | string
  error: true
  message: string
}

type CrunchyrollResponse<D extends object = any> =
  | RequestSuccess<CrunchyrollSuccess<D>>
  | RequestError<CrunchyrollError>

interface LoginSuccess {
  user: User
  auth: string
  expires: Date
}

type RequestTypes =
  | 'add_to_queue'
  | 'categories'
  | 'info'
  | 'list_media'
  | 'log'
  | 'login'
  | 'logout'
  | 'queue'
  | 'recently_watched'
  | 'remove_from_queue'
  | 'start_session'

const getUrl = (req: RequestTypes) =>
  `https://${API_URL}/${req}.${VERSION}.json`

const responseIsError = (
  res: CrunchyrollResponse,
): res is RequestError<CrunchyrollError> => {
  return res.body.error === true
}

let _sessionId: string = userStore.get('crunchyroll.sessionId', '')

export interface SessionResponse {
  session_id: string
  country_code: string
}

export const createSession = async () => {
  const response = (await superagent
    .get(getUrl('start_session'))
    .ok(T)
    .query({
      auth: userStore.get('crunchyroll.token', null),
      locale,
      device_type,
      device_id: `${uuid()}`,
      version: '1.1',
      access_token,
      user_id: userStore.get('crunchyroll.userId', null),
    })) as CrunchyrollResponse<SessionResponse>

  if (responseIsError(response)) {
    return Promise.reject(response.body.message)
  }

  _sessionId = response.body.data.session_id

  userStore.set('crunchyroll.sessionId', _sessionId)
  userStore.set('crunchyroll.country', response.body.data.country_code)

  return response.body.data
}

export const createUnblockedSession = async () => {
  const response = (await superagent
    .get(`https://${CR_UNBLOCKER_URL}/start_session`)
    .ok(T)
    .query({
      auth: userStore.get('crunchyroll.token', null),
      version: '1.1',
      user_id: userStore.get('crunchyroll.userId', null),
    })) as CrunchyrollResponse<SessionResponse>

  if (responseIsError(response)) {
    return Promise.reject(response.body.message)
  }

  _sessionId = response.body.data.session_id

  userStore.set('crunchyroll.sessionId', _sessionId)
  userStore.set('crunchyroll.country', response.body.data.country_code)

  return response.body.data
}

const mediaFields = [
  'most_likely_media',
  'media',
  'media.name',
  'media.description',
  'media.episode_number',
  'media.duration',
  'media.playhead',
  'media.screenshot_image',
  'media.media_id',
  'media.series_id',
  'media.series_name',
  'media.collection_id',
  'media.url',
]

export const login = async (username: string, password: string) => {
  const data = new FormData()
  data.append('account', username)
  data.append('password', password)
  data.append('session_id', _sessionId)

  const response = (await superagent
    .post(getUrl('login'))
    .send(data)) as CrunchyrollResponse<LoginSuccess>

  if (responseIsError(response)) {
    return Promise.reject(response.body.message)
  }

  userStore.set('crunchyroll', {
    sessionId: _sessionId,
    userId: response.body.data.user.user_id,
    token: response.body.data.auth,
  })

  return response.body.data
}

export const logout = () => {
  userStore.delete('crunchyroll')
}

export const fetchEpisodesOfCollection = async (
  collectionId: string,
): Promise<Episode[]> => {
  const response = (await superagent.get(getUrl('list_media')).query({
    session_id: _sessionId,
    locale,
    collection_id: collectionId,
    limit: 1000,
    fields: mediaFields.join(','),
  })) as CrunchyrollResponse<_Media[]>

  if (responseIsError(response)) {
    return Promise.reject(response.body.message)
  }

  return response.body.data.filter(removeExtraEpisodes).map(mediaToEpisode)
}

export const fetchEpisode = async (mediaId: string): Promise<Episode> => {
  const response = (await superagent.get(getUrl('info')).query({
    session_id: _sessionId,
    locale,
    media_id: mediaId,
    fields: mediaFields.join(','),
  })) as CrunchyrollResponse<_Media>

  if (responseIsError(response)) {
    return Promise.reject(response.body.message)
  }

  return mediaToEpisode(
    response.body.data,
    Number(response.body.data.episode_number),
  )
}

export const fetchSeasonFromEpisode = async (
  mediaId: string,
): Promise<Episode[]> => {
  const episode = await fetchEpisode(mediaId)

  return fetchEpisodesOfCollection(episode.crunchyroll.collection)
}

interface StreamInfo {
  playhead: number
  stream_data: _StreamData
}
const fetchStreamInfo = async (mediaId: string): Promise<StreamInfo> => {
  const response = (await superagent.get(getUrl('info')).query({
    session_id: _sessionId,
    locale,
    media_id: mediaId,
    fields: ['media.stream_data', 'media.playhead'].join(','),
  })) as CrunchyrollResponse<StreamInfo>

  if (responseIsError(response)) {
    return Promise.reject(response.body.message)
  }

  const { playhead, stream_data } = response.body.data
  return {
    playhead,
    stream_data,
  }
}

export const fetchStream = async (mediaId: string): Promise<Stream> => {
  const streamInfo = await fetchStreamInfo(mediaId)
  const { url } = streamInfo.stream_data.streams[0]

  return {
    url,
    progress: streamInfo.playhead,
  }
}

export const setProgressOfEpisode = async (
  mediaId: string,
  progressInSeconds: number,
) => {
  const response = (await superagent.get(getUrl('log')).query({
    session_id: _sessionId,
    locale,
    event: 'playback_status',
    media_id: mediaId,
    playhead: progressInSeconds,
    fields: mediaFields.join(','),
  })) as CrunchyrollResponse

  if (responseIsError(response)) {
    throw new Error('Could not update progress of episode!')
  }
}

const mediaToEpisode = (
  {
    name,
    description,
    duration,
    screenshot_image,
    media_id,
    series_id,
    collection_id,
    url,
    playhead,
  }: _Media,
  index: number,
): Episode => ({
  title: name,
  description,
  index,
  episodeNumber: index + 1,
  duration,
  progress: playhead || null,
  thumbnail: screenshot_image.full_url,

  crunchyroll: {
    id: media_id,
    seriesId: series_id,
    collection: collection_id,
    url,
  },
})

const removeExtraEpisodes = ({ episode_number, duration }: _Media) =>
  Number(episode_number) % 1 === 0 && duration > 300

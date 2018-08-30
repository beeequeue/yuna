/* tslint:disable:class-name */
import superagent from 'superagent/superagent'
import uuid from 'uuid/v4'

import { RequestError, RequestSuccess } from '@/utils'
import { QueueItem } from '@/state/user'
import { Anime, Episode, ImageSet, StreamData } from '@/types'

const API_URL = 'api.crunchyroll.com'
const VERSION = '0'
const accessToken = process.env.ACCESS_TOKEN

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

interface _ImageSet {
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

interface _StreamData {
  hardsub_lang: string
  audio_lang: string
  format: 'hls'
  streams: [
    {
      quality: 'adaptive'
      expires: string
      url: string
    },
    {
      quality: 'low'
      expires: string
      url: string
    },
    {
      quality: 'mid'
      expires: string
      url: string
    },
    {
      quality: 'high'
      expires: string
      url: string
    },
    {
      quality: 'ultra'
      expires: string
      url: string
    }
  ]
}

interface _Media {
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
  stream_data: _StreamData
}

interface _Series {
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

interface _QueueEntry {
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

export const createSession = async () => {
  const response = (await superagent.post(getUrl('start_session')).query({
    access_token: accessToken,
    device_type: 'com.crunchyroll.windows.desktop',
    device_id: `NANI-${uuid()}`,
  })) as CrunchyrollResponse<{ session_id: string }>

  if (responseIsError(response)) {
    throw new Error(response.body.message)
  }

  return response.body.data.session_id
}

const mediaFields = [
  'most_likely_media',
  'media.name',
  'media.description',
  'media.episode_number',
  'media.screenshot_image',
  'media.media_id',
  'media.series_id',
  'media.series_name',
  'media.collection_id',
  'media.url',
  'media.stream_data',
]
const seriesFields = [
  'series',
  'series.name',
  'series.description',
  'series.series_id',
  'series.url',
  'series.media_count',
  'series.landscape_image',
  'series.portrait_image',
]

export const login = async (
  username: string,
  password: string,
  sessionId: string,
) => {
  const data = new FormData()
  data.append('account', username)
  data.append('password', password)
  data.append('session_id', sessionId)

  const response = (await superagent
    .post(getUrl('login'))
    .send(data)) as CrunchyrollResponse<LoginSuccess>

  if (responseIsError(response)) {
    throw new Error(response.body.message)
  }

  return response.body.data
}

export const fetchQueue = async (sessionId: string) => {
  const response = (await superagent.get(getUrl('queue')).query({
    media_types: 'anime',
    session_id: sessionId,
    fields: [...mediaFields, ...seriesFields].join(','),
  })) as CrunchyrollResponse<_QueueEntry[]>

  if (responseIsError(response)) {
    throw new Error(response.body.message)
  }

  return response.body.data.map(queueEntryToQueueItem)
}

export const fetchStream = async (sessionId: string, episode: Episode) => {
  if (!episode.crunchyroll) throw new Error('No crunchyroll data!')

  const response = (await superagent.get(getUrl('info')).query({
    session_id: sessionId,
    media_id: episode.crunchyroll.id,
    fields: 'media.stream_data',
  })) as CrunchyrollResponse<{ stream_data: _StreamData }>

  if (responseIsError(response)) {
    throw new Error(response.body.message)
  }

  return convertStreamData(response.body.data.stream_data)
}

// Mapping functions
const convertImageSet = (imgSet: _ImageSet): ImageSet => ({
  small: imgSet.medium_url,
  large: imgSet.full_url,
  wide: imgSet.fwide_url,
  height: Number(imgSet.height),
  width: Number(imgSet.width),
})

const convertStreamData = (streamData: _StreamData): StreamData => ({
  subLanguage: streamData.hardsub_lang,
  audioLanguage: streamData.audio_lang,
  format: 'hls',
  streams: streamData.streams.map((s: any) => ({
    ...s,
    expires: new Date(s.expires),
  })),
})

const mediaToEpisode = (
  {
    name,
    description,
    episode_number,
    duration,
    screenshot_image,
    media_id,
    series_id,
    series_name,
    collection_id,
    url,
    stream_data,
  }: _Media,
  playhead: number,
): Episode => ({
  name,
  description,
  animeName: series_name,
  index: Number(episode_number),
  duration,
  progress: playhead,
  image: convertImageSet(screenshot_image),

  crunchyroll: {
    id: media_id,
    seriesId: series_id,
    collection: collection_id,
    url,
    streamData: convertStreamData(stream_data),
  },
})

const seriesToAnime = ({
  name,
  description,
  series_id,
  url,
  landscape_image,
  portrait_image,
}: _Series): Anime => ({
  name,
  romajiName: name,
  description,
  episodes: 12,
  crunchyroll: {
    id: series_id,
    url,
  },
  landscapeImage: convertImageSet(landscape_image),
  portraitImage: convertImageSet(portrait_image),
})

const queueEntryToQueueItem = ({
  most_likely_media,
  most_likely_media_playhead,
  series,
}: _QueueEntry): QueueItem => ({
  episode: mediaToEpisode(most_likely_media, most_likely_media_playhead),
  series: seriesToAnime(series),
})

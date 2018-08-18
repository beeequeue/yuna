import superagent from 'superagent'
import uuid from 'uuid/v4'
import { RequestError, RequestSuccess } from './../utils'

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
  created: Date | string
}

export interface ImageSet {
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

export interface Media {
  class: string
  media_id: string
  etp_guid: string
  collection_id: string
  collection_etp_guid: string
  series_id: string
  series_etp_guid: string
  media_type: string
  episode_number: string
  name: string
  description: string
  screenshot_image: ImageSet
  bif_url: string
  url: string
  clip: boolean
  available: boolean
  premium_available: boolean
  free_available: boolean
  availability_notes: string
  available_time: Date
  unavailable_time: Date
  premium_available_time: Date
  premium_unavailable_time: Date
  free_available_time: Date
  free_unavailable_time: Date
  created: Date
}

export interface Series {
  class: 'series'
  series_id: string
  etp_guid: string
  url: string
  name: string
  media_type: 'anime'
  landscape_image: ImageSet
  portrait_image: ImageSet
  description: string
}

export interface QueueEntry {
  last_watched_media: Media
  most_likely_media: Media
  ordering: number
  queue_entry_id: number
  last_watched_media_playhead: number
  most_likely_media_playhead: number
  playhead: number
  series: Series
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

const handleResponse = (data: any) => {
  const newData: any = {}
  const keys = Object.keys(data)

  keys.forEach(key => {
    const value = data[key]

    if (typeof value === 'object' && value != null) {
      newData[key] = handleResponse(value)
    } else if (
      typeof value === 'string' &&
      value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{2}:\d{2}/)
    ) {
      newData[key] = new Date(value)
    }
  })

  return newData
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

export const getQueue = async (token: string) => {
  const response = (await superagent
    .get(getUrl('queue'))
    .query({ media_types: 'anime', session_id: token })) as CrunchyrollResponse<
    QueueEntry
  >

  if (responseIsError(response)) {
    throw new Error(response.body.message)
  }

  return handleResponse(response.body.data)
}

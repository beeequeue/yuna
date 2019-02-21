/* eslint-disable class-name */
import { activeWindow } from 'electron-util'
import { anyPass, complement, mapAsync, T } from 'rambdax'
import superagent from 'superagent/superagent'
import { ActionContext, Store } from 'vuex'
import uuid from 'uuid/v4'

import { EpisodeListEpisodes, Provider } from '@/graphql/types'

import { getConfig } from '@/config'
import { userStore } from '@/lib/user'
import {
  getIsConnectedTo,
  setCrunchyroll,
  setCrunchyrollCountry,
} from '@/state/auth'
import { delay, removeCookies, RequestError, RequestSuccess } from '@/utils'
import { Stream } from '@/types'
import { getSettings, SettingsStore } from '@/state/settings'
import { error } from 'electron-log'

const CR_UNBLOCKER_URL = 'api2.cr-unblocker.com'
const API_URL = 'api.crunchyroll.com'
const VERSION = '0'
const ENGLISH = 'enUS'
// eslint-disable-next-line variable-name
const device_type = 'com.crunchyroll.windows.desktop'
// eslint-disable-next-line variable-name
const access_token = getConfig('ACCESS_TOKEN')

export enum CrunchyrollLocale {}

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
  media_type: 'anime' | 'drama'
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

interface _Collection {
  availability_notes: string
  class: 'collection'
  media_type: 'anime'
  series_id: string
  collection_id: string
  complete: boolean
  name: string
  description: string
  landscape_image: _ImageSet | null
  portrait_image: _ImageSet | null
  season: string
  created: string
}

interface _Locale {
  locale_id: string
  label: string
}

export interface _CollectionWithEpisodes extends _Collection {
  episodes: EpisodeListEpisodes[]
}

export interface _SeriesWithCollections {
  id: number
  seriesId: number
  title: string
  description: string
  url: string
  landscapeImage: string
  portraitImage: string
  collections: _CollectionWithEpisodes[]
}

export interface _AutocompleteResult {
  class: 'series'
  media_type: 'anime'
  series_id: string
  name: string
  description: string
  url: string
  etp_guid: string
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
  code: 'bad_request' | 'bad_session'
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

export interface SearchResult {
  id: number
  title: string
  description: string
  url: string
  portraitImage: string
  landscapeImage: string
}

type RequestTypes =
  | 'add_to_queue'
  | 'autocomplete'
  | 'categories'
  | 'info'
  | 'list_collections'
  | 'list_media'
  | 'list_locales'
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

let _sessionId: string = userStore.get('crunchyroll.token', '')
let _locales: _Locale[] = []

export interface SessionResponse {
  session_id: string
  country_code: string
}

interface StreamInfo {
  playhead: number
  stream_data: _StreamData
}

type StoreType = Store<any> | ActionContext<any, any>

export class Crunchyroll {
  public static get locales() {
    return _locales
  }

  public static createSession = async (store: StoreType) => {
    const { useCRUnblocker } = getSettings(store)
    let data: SessionResponse | null = null

    if (useCRUnblocker) {
      try {
        data = await Crunchyroll.createUnblockedSession(store)
      } catch (e) {
        error(e)
        store.dispatch(
          'app/sendErrorToast',
          'Could not create US session. 😞',
          {
            root: true,
          },
        )
      }
    }

    if (data == null) {
      data = await Crunchyroll.createNormalSession(store)
    }

    if (getIsConnectedTo(store).crunchyroll) {
      _locales = await Crunchyroll.fetchLocales()
    }

    return data
  }

  public static login = async (
    store: StoreType,
    username: string,
    password: string,
  ) => {
    const data = new FormData()
    data.append('account', username)
    data.append('password', password)
    data.append('session_id', _sessionId)

    const response = (await superagent
      .post(getUrl('login'))
      .send(data)) as CrunchyrollResponse<LoginSuccess>

    removeCookies({ domain: 'crunchyroll.com' })

    if (responseIsError(response)) {
      return Promise.reject(response.body.message)
    }

    const session = await Crunchyroll.createSession(store)
    const user = response.body.data.user

    _sessionId = session.session_id
    setCrunchyroll(store, {
      user: {
        id: Number(user.user_id),
        name: user.username,
        url: `https://www.crunchyroll.com/user/${user.username}`,
      },
      token: session.session_id,
      refreshToken: response.body.data.auth,
      expires: null,
    })
  }

  /*
   *  By not removing user until after we get a new session
   *  we make it look like they aren't logged out until then.
   */
  public static logOut = async (store: StoreType) => {
    setCrunchyroll(store, {
      user: store.state.auth.crunchyroll.user,
      token: null as any,
      refreshToken: null as any,
      expires: null,
    })

    removeCookies({ domain: 'crunchyroll.com' })

    await Crunchyroll.createSession(store)

    setCrunchyroll(store, {
      user: null,
      token: null as any,
      refreshToken: null as any,
      expires: null,
    })
  }

  public static fetchLocales = async (): Promise<_Locale[]> => {
    let response = await Crunchyroll.request<_Locale[]>('list_locales')

    if (responseIsError(response)) {
      await delay(1500)

      response = await Crunchyroll.request<_Locale[]>('list_locales')
      if (responseIsError(response)) {
        throw new Error(response.body.message)
      }
    }

    return response.body.data
  }

  public static fetchSeriesAndCollections = async (
    anilistId: number,
    seriesId: number,
  ): Promise<_SeriesWithCollections> => {
    const response = await Crunchyroll.request<_Series>('info', {
      series_id: seriesId,
    })

    if (responseIsError(response)) {
      if (response.body.code === 'bad_session') {
        activeWindow().reload()
      }

      throw new Error(response.body.message)
    }

    const collections = await Crunchyroll.fetchCollectionsAndEpisodes(
      anilistId,
      seriesId,
    )

    return {
      id: anilistId,
      seriesId,
      title: response.body.data.name,
      description: response.body.data.description,
      url: response.body.data.url,
      landscapeImage: response.body.data.landscape_image.full_url,
      portraitImage: response.body.data.portrait_image.full_url,
      collections,
    }
  }

  public static fetchEpisode = async (mediaId: string): Promise<_Media> => {
    const response = await Crunchyroll.request<_Media>('info', {
      media_id: mediaId,
      fields: mediaFields.join(','),
    })

    if (responseIsError(response)) {
      if (response.body.code === 'bad_session') {
        activeWindow().reload()
      }

      throw new Error(response.body.message)
    }

    return response.body.data
  }

  public static fetchCollectionsAndEpisodes = async (
    id: number,
    seriesId: number,
  ): Promise<_CollectionWithEpisodes[]> => {
    const response = await Crunchyroll.request<_Collection[]>(
      'list_collections',
      {
        series_id: seriesId,
      },
    )

    if (responseIsError(response)) {
      if (response.body.code === 'bad_session') {
        activeWindow().reload()
      }

      throw new Error(response.body.message)
    }

    return mapAsync<_CollectionWithEpisodes>(
      async (coll: _Collection) => ({
        ...coll,
        episodes: await Crunchyroll.fetchEpisodesOfCollection(
          id,
          coll.collection_id,
        ),
      }),
      response.body.data,
    )
  }

  public static fetchEpisodesOfCollection = async (
    id: number,
    collectionId: string,
  ): Promise<EpisodeListEpisodes[]> => {
    const response = await Crunchyroll.request<_Media[]>('list_media', {
      collection_id: collectionId,
      limit: 1000,
      fields: mediaFields.join(','),
    })

    if (responseIsError(response)) {
      if (response.body.code === 'bad_session') {
        activeWindow().reload()
      }

      throw new Error(response.body.message)
    }

    const episodes = response.body.data
      .filter(isRealEpisode)
      .map(mediaToEpisode(id)) as any

    return fixEpisodeNumbers(episodes)
  }

  public static fetchSeasonFromEpisode = async (
    id: number,
    mediaId: string,
  ): Promise<EpisodeListEpisodes[]> => {
    const episode = await Crunchyroll.fetchEpisode(mediaId)

    return Crunchyroll.fetchEpisodesOfCollection(id, episode.collection_id)
  }

  public static fetchStream = async (mediaId: number): Promise<Stream> => {
    const streamInfo = await Crunchyroll.fetchStreamInfo(mediaId.toString())
    const streams = streamInfo.stream_data.streams

    if (!streams || streams.length < 1) {
      throw new Error(`Did not receive stream data from Crunchyroll.`)
    }

    return {
      url: streams[0].url,
      progress: streamInfo.playhead,
    }
  }

  public static setProgressOfEpisode = async (
    mediaId: number,
    progressInSeconds: number,
  ) => {
    const response = await Crunchyroll.request('log', {
      event: 'playback_status',
      media_id: mediaId,
      playhead: progressInSeconds,
    })

    if (responseIsError(response)) {
      throw new Error('Could not update progress of episode!')
    }
  }

  public static searchByString = async (
    query: string,
  ): Promise<SearchResult[]> => {
    const response = await Crunchyroll.request<_AutocompleteResult[]>(
      'autocomplete',
      {
        q: query,
        media_types: 'anime',
        limit: 10,
      },
    )

    if (responseIsError(response)) {
      if (response.body.code === 'bad_session') {
        activeWindow().reload()
      }

      throw new Error(response.body.message)
    }

    return response.body.data.map(result => ({
      id: Number(result.series_id),
      title: result.name,
      description: result.description,
      url: result.url,
      portraitImage:
        result.portrait_image.large_url || result.portrait_image.medium_url,
      landscapeImage:
        result.landscape_image.full_url ||
        result.landscape_image.large_url ||
        result.landscape_image.medium_url,
    }))
  }

  private static request = async <B extends {}>(
    type: RequestTypes,
    query: any = {},
    useCustomLocale?: boolean,
  ) =>
    (await superagent.get(`https://${API_URL}/${type}.${VERSION}.json`).query({
      session_id: _sessionId,
      locale: useCustomLocale ? SettingsStore.get('crLocale') : ENGLISH,
      device_type,
      ...query,
    })) as CrunchyrollResponse<B>

  private static createNormalSession = async (store: StoreType) => {
    const response = await Crunchyroll.request<SessionResponse>(
      'start_session',
      {
        access_token,
        device_id: uuid(),
        version: '1.1',
        auth: userStore.get('crunchyroll.refreshToken', null),
      },
    )

    if (responseIsError(response)) {
      throw new Error(response.body.message)
    }

    _sessionId = response.body.data.session_id

    userStore.set('crunchyroll.sessionId', _sessionId)
    userStore.set('crunchyroll.country', response.body.data.country_code)

    setCrunchyrollCountry(store, response.body.data.country_code)

    return response.body.data
  }

  private static createUnblockedSession = async (store: StoreType) => {
    const response = (await superagent
      .get(`https://${CR_UNBLOCKER_URL}/start_session`)
      .ok(T)
      .query({
        auth: userStore.get('crunchyroll.refreshToken', null),
        version: '1.1',
        user_id: userStore.get('crunchyroll.user.id', null),
      })) as CrunchyrollResponse<SessionResponse>

    if (responseIsError(response)) {
      return Promise.reject(response.body.message)
    }

    _sessionId = response.body.data.session_id

    userStore.set('crunchyroll.sessionId', _sessionId)

    setCrunchyrollCountry(store, response.body.data.country_code)

    return response.body.data
  }

  private static fetchStreamInfo = async (
    mediaId: string,
  ): Promise<StreamInfo> => {
    const response = await Crunchyroll.request<StreamInfo>(
      'info',
      {
        media_id: mediaId,
        fields: ['media.stream_data', 'media.playhead'].join(','),
      },
      true,
    )

    if (responseIsError(response)) {
      if (response.body.code === 'bad_session') {
        activeWindow().reload()
      }

      throw new Error(response.body.message)
    }

    const { playhead, stream_data } = response.body.data
    return {
      playhead,
      stream_data,
    }
  }
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

const mediaToEpisode = (id: number) => (
  {
    name,
    duration,
    screenshot_image,
    media_id,
    url,
    playhead,
    episode_number,
  }: _Media,
  index: number,
): Omit<EpisodeListEpisodes, 'isWatched'> => ({
  __typename: 'Episode',
  provider: Provider.Crunchyroll,
  id: Number(media_id),
  animeId: id,
  title: name,
  index,
  episodeNumber: episode_number as any,
  duration,
  progress: playhead || null,
  thumbnail: screenshot_image.full_url,
  url,
})

const notNumberRegex = /[^\d.]/g
const onlyNumbers = (str: string) => str.replace(notNumberRegex, '')

const getEpisodeNumber = (num: string) => Number(onlyNumbers(num))

const fixEpisodeNumbers = (episodes: EpisodeListEpisodes[]) => {
  const firstIndex = getEpisodeNumber(episodes[0].episodeNumber as any) - 1

  return episodes.map(ep => {
    const num = getEpisodeNumber(ep.episodeNumber as any)

    return {
      ...ep,
      episodeNumber: num - firstIndex,
    }
  })
}

// Exclude episodes from episode lists
const episodeNumberIsHalf = ({ episode_number }: _Media) =>
  getEpisodeNumber(episode_number) % 1 !== 0

const isSpecialEpisode = ({ episode_number }: _Media) =>
  episode_number === 'SP' || episode_number === ''

const isShorterThanFiveMinutes = ({ duration }: _Media) => duration < 300

const isRealEpisode = complement(
  anyPass([episodeNumberIsHalf, isSpecialEpisode, isShorterThanFiveMinutes]),
)

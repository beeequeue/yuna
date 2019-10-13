import { Store } from 'vuex'
import superagent from 'superagent/dist/superagent'
import { oc } from 'ts-optchain'
import { captureException } from '@sentry/browser'

import { getConfig } from '@/config'
import { isNil, RequestError, RequestSuccess } from '@/utils'
import { setSimkl } from '@/state/auth'
import { updateMainListPlugin } from '@/state/settings'
import { MediaListStatus } from '@/graphql/types'
import { userStore } from '@/lib/user'

type SimklListStatus =
  | 'plantowatch'
  | 'watching'
  | 'notinteresting'
  | 'hold'
  | 'completed'

interface _Show {
  title: string
  year: number
  type: 'anime'
  ids: {
    simkl: number
    slug: string
  }
}

interface _ShowFull extends _Show {
  ids: {
    simkl: number
    slug: string
    anidb: string
    ann: string
    mal: string
    anfo: string
    wikien: string
    wikijp: string
    allcin: string
    imdb: string
    offjp: string
    offen: string
    tmdb: string
  }
  en_title: string
  rank: number
  poster: string
  fanart: string
  first_aired: string
  airs: {
    day: string
    time: string
    timezone: string
  }
  runtime: number
  certification: string | null
  overview: string
  genres: string[]
  country: string
  total_episodes: number
  status: 'ended'
  network: string
  anime_type: 'tv'
  ratings: {
    simkl: {
      rating: number
      votes: number
    }
    imdb: {
      rating: number
      votes: number
    }
    mal: {
      rating: number
      votes: number
      rank: number
    }
  }
  trailers: Array<{
    name: string | null
    youtube: string
    size: number
  }>
}

interface _OauthCode {
  result: string
  device_code: 'DEVICE_CODE'
  user_code: string
  verification_url: string
  expires_in: number
  interval: number
}

interface _OauthPinPending {
  result: 'KO'
  message: string
}

interface _OauthPinFinished {
  result: 'OK'
  access_token: string
}

interface _UserSettings {
  user: {
    name: string
    joined_at: string
    gender: string
    avatar: string
    bio: string
    loc: string
    age: string
  }
  account: {
    id: number
    timezone: string
  }
  connections: {
    facebook: boolean
  }
}

interface _SyncHistory {
  added: {
    movies: number
    shows: number
    episodes: number
  }
  not_found: {
    movies: unknown[]
    shows: unknown[]
    episodes: unknown[]
  }
}

interface _SyncAllItems {
  shows: unknown[]
  movies: unknown[]
  anime: SimklListEntry[]
}

interface _SyncAddToList {
  movies?: unknown[]
  shows: Array<{
    to: SimklListStatus
    ids: {
      simkl?: number
      mal?: number
    }
  }>
}

interface _SetWatchedBody {
  shows: Array<{
    ids: { mal: number }
    episodes: Array<{ number: number }>
  }>
}

export interface SimklListEntry {
  last_watched_at: string
  user_rating: number
  status: SimklListStatus
  last_watched: string | null
  next_to_watch: string | null
  watched_episodes_count: number
  total_episodes_count: number
  not_aired_episodes_count: number
  show: {
    title: string
    poster: string
    year: number
    ids: {
      simkl: number
      imdb: string
      mal: string
      anidb: string
    }
  }
}

interface SimklQuery {
  extended?: 'full'
}

type SimklResponse<D extends {} | null = any> =
  | RequestSuccess<D>
  | RequestError<null>

const BASE_URL = 'https://api.simkl.com'

const responseIsError = (
  res: SimklResponse<any>,
): res is RequestError<null> => {
  return res.status > 400 || !res.ok
}

let _token = userStore.get('simkl.token', '')

export class Simkl {
  private static watchlist: SimklListEntry[] = []
  private static lastUpdate = 0

  private static async getWatchedBody(
    malId: number,
    progress: number,
  ): Promise<{ watched: _SetWatchedBody; notWatched: _SetWatchedBody }> {
    const anime = await this.getAnimeInfo(malId)

    if (isNil(anime)) throw new Error('Could not find Anime on Simkl.')

    const episodes = Array.from({ length: anime.total_episodes }).map(
      (_, i) => ({ number: i + 1 }),
    )

    const watchedEpisodes = episodes.slice(0, progress)
    const notWatchedEpisodes = episodes.slice(progress)

    return {
      watched: {
        shows: [
          {
            ids: { mal: malId },
            episodes: watchedEpisodes,
          },
        ],
      },
      notWatched: {
        shows: [
          {
            ids: { mal: malId },
            episodes: notWatchedEpisodes,
          },
        ],
      },
    }
  }

  private static async updateWatchlist() {
    const response = await Simkl.request<
      _SyncAllItems | null,
      SimklQuery & { date_from: string }
    >('sync/all-items', {
      type: 'post',
      query: { date_from: new Date(this.lastUpdate).toISOString() },
    })

    if (responseIsError(response)) {
      throw new Error('Could not update Simkl watchlist')
    }

    this.lastUpdate = Date.now()

    if (isNil(response.body)) return

    const updatedItems = response.body.anime

    updatedItems.forEach(item => {
      const index = this.watchlist.findIndex(
        listItem => listItem.show.ids.simkl === item.show.ids.simkl,
      )

      if (index === -1) {
        return this.watchlist.push(item)
      }

      this.watchlist[index] = item
    })
  }

  public static readonly clientId = getConfig('SIMKL_ID')!

  public static statusFromSimklStatus(status: SimklListStatus) {
    switch (status) {
      case 'plantowatch':
        return MediaListStatus.Planning
      case 'watching':
        return MediaListStatus.Current
      case 'notinteresting':
        return MediaListStatus.Dropped
      case 'hold':
        return MediaListStatus.Paused
      case 'completed':
        return MediaListStatus.Completed
    }
  }

  public static simklStatusFromMediaStatus(
    status: MediaListStatus,
  ): SimklListStatus {
    switch (status) {
      case MediaListStatus.Planning:
        return 'plantowatch'
      case MediaListStatus.Completed:
        return 'completed'
      case MediaListStatus.Repeating:
      case MediaListStatus.Current:
        return 'watching'
      case MediaListStatus.Dropped:
        return 'notinteresting'
      case MediaListStatus.Paused:
        return 'hold'
    }
  }

  public static async getAnimeInfo(malId: number) {
    const response = await this.request<_ShowFull[]>('search/id', {
      query: {
        mal: malId,
      },
    })

    if (responseIsError(response)) {
      throw new Error(
        `Couldn't fetch /search/id?mal=${malId} (${response.status})`,
      )
    }

    const simklId = oc(response).body[0].ids.simkl() || null

    if (isNil(simklId)) return null

    const fullResponse = await this.request<_ShowFull>(`anime/${simklId}`, {
      full: true,
    })

    if (responseIsError(fullResponse)) {
      throw new Error(
        `Couldn't fetch /anime/${simklId} (${fullResponse.status})`,
      )
    }

    return fullResponse.body
  }

  public static async getRating(malId: number): Promise<number | null> {
    const info = await this.getAnimeInfo(malId)

    return oc(info).ratings.simkl.rating() || null
  }

  public static async getLink(malId: number) {
    return `${BASE_URL}/redirect?mal=${malId}`
  }

  public static async getAnidbID(malId: number) {
    const anime = await this.getAnimeInfo(malId)

    const id = oc(anime).ids.anidb()

    if (isNil(id)) return null

    return Number(id)
  }

  public static async getDeviceCode() {
    const response = await this.request<_OauthCode>('oauth/pin')

    if (responseIsError(response)) {
      throw new Error('Could not get code from Simkl!')
    }

    return {
      code: response.body.user_code,
      expires: response.body.expires_in,
      interval: response.body.interval,
      url: response.body.verification_url,
    }
  }

  public static async pollForToken({
    store,
    code,
    timeout,
    interval,
  }: {
    store: Store<any>
    code: string
    timeout: number
    interval: number
  }) {
    return new Promise(resolve => {
      const makeRequest = async () =>
        this.request<_OauthPinPending | _OauthPinFinished>(`oauth/pin/${code}`)

      const intervalId = window.setInterval(async () => {
        const response = await makeRequest()

        if (responseIsError(response) || response.body.result !== 'OK') return

        window.clearInterval(intervalId)
        window.clearInterval(timeoutId)

        const token = response.body.access_token

        _token = token
        const user = await this.getUserInfo()

        setSimkl(store, {
          token,
          expires: null,
          user,
        })
        updateMainListPlugin(store)

        resolve()
      }, interval * 1000)

      const timeoutId = window.setTimeout(() => {
        window.clearInterval(intervalId)
      }, timeout * 1000)
    })
  }

  public static async getUserInfo() {
    const response = await this.request<_UserSettings>('/users/settings')

    if (responseIsError(response)) {
      throw new Error('Could not get User from Simkl!')
    }

    return {
      name: response.body.user.name,
      id: response.body.account.id,
      url: `https://simkl.com/${response.body.account.id}`,
    }
  }

  public static async setProgress(malId: number, progress: number) {
    const bodies = await this.getWatchedBody(malId, progress)

    const promises = []

    if (bodies.watched.shows[0].episodes.length > 0) {
      promises.push(
        this.request<_SyncHistory, _SetWatchedBody>('sync/history', {
          type: 'post',
          body: bodies.watched,
        }),
      )
    }

    if (bodies.notWatched.shows[0].episodes.length > 0) {
      promises.push(
        this.request<_SyncHistory, _SetWatchedBody>('sync/history/remove', {
          type: 'post',
          body: bodies.notWatched,
        }),
      )
    }

    const responses = await Promise.all(promises)

    if (responses.some(responseIsError)) {
      responses.filter(r => !r.ok).forEach(r => captureException(r.error))
      throw new Error('Could not scrobble progress to Simkl.')
    }
  }

  public static async disconnect(store: Store<any>) {
    setSimkl(store, null)

    updateMainListPlugin(store)
  }

  public static async watchedInfo(malId: number, skipUpdate?: true) {
    if (!skipUpdate) {
      await this.updateWatchlist()
    }

    const item = this.watchlist.find(
      item => Number(item.show.ids.mal) === malId,
    )

    if (isNil(item)) {
      return null
    }

    return item
  }

  public static async getAllListEntries(skipUpdate?: true) {
    if (!skipUpdate) {
      await this.updateWatchlist()
    }

    return this.watchlist
  }

  public static async addItemToList(malId: number, list: SimklListStatus) {
    const response = await this.request<
      { added: _SyncAddToList },
      _SyncAddToList
    >('sync/add-to-list', {
      type: 'post',
      body: {
        shows: [
          {
            to: list,
            ids: {
              mal: malId,
            },
          },
        ],
      },
    })

    if (responseIsError(response)) {
      throw new Error('Could not add show to list.')
    }

    return response.body.added.shows[0]
  }

  public static async removeFromList(malId: number): Promise<boolean> {
    const response = await this.request('sync/history/remove', {
      type: 'post',
      body: {
        shows: [{ ids: { mal: malId } }],
      },
    })

    if (responseIsError(response)) {
      throw new Error('Could not delete item from Simkl List.')
    }

    const index = this.watchlist.findIndex(
      item => Number(item.show.ids.mal) === malId,
    )
    if (index !== -1) {
      this.watchlist.splice(index, 1)
    }

    return true
  }

  /***
   * @param rating Rating in 0-10 format
   * @param malId
   */
  public static async addRating(malId: number, rating: number) {
    const response = await this.request('sync/ratings', {
      type: 'post',
      body: {
        shows: [
          {
            ids: { mal: malId },
            rating,
          },
        ],
      },
    })

    if (responseIsError(response)) {
      throw new Error('Could not update Simkl rating.')
    }
  }

  private static async request<B extends {} | null = any, Q extends {} = any>(
    path: string,
    {
      type = 'get',
      full = false,
      query = {} as any,
      body,
    }: {
      type?: 'get' | 'post'
      full?: boolean
      query?: Q & SimklQuery
      body?: Q & SimklQuery
    } = {},
  ) {
    if (full) {
      query.extended = 'full'
    }

    return (await superagent[type](`${BASE_URL}/${path}`)
      .set('simkl-api-key', this.clientId)
      .auth(_token, { type: 'bearer' })
      .query(query)
      .send(body)) as SimklResponse<B>
  }
}

import superagent from 'superagent/dist/superagent'
import { oc } from 'ts-optchain'

import { getConfig } from '@/config'
import { isNil, RequestError, RequestSuccess } from '@/utils'
import { Store } from 'vuex'
import { setSimkl } from '@/state/auth'

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

interface SimklQuery {
  extended?: 'full'
}

type SimklResponse<D extends {} = any> = RequestSuccess<D> | RequestError<null>

const BASE_URL = 'https://api.simkl.com'

const responseIsError = (
  res: SimklResponse<any>,
): res is RequestError<null> => {
  return res.status !== 200 && !isNil(res.body)
}

export class Simkl {
  public static readonly clientId = getConfig('SIMKL_ID')

  public static async getAnidbID(malId: number) {
    const response = await this.getRequest<_ShowFull[]>('search/id', false, {
      mal: malId,
    })

    if (responseIsError(response)) {
      throw new Error(
        `Couldn't fetch /search/id?mal=${malId} (${response.status})`,
      )
    }

    const simklId = oc(response).body[0].ids.simkl() || null

    if (isNil(simklId)) return null

    const fullResponse = await this.getRequest<_ShowFull>(
      `anime/${simklId}`,
      true,
    )

    if (responseIsError(fullResponse)) {
      throw new Error(
        `Couldn't fetch /anime/${simklId} (${fullResponse.status})`,
      )
    }

    const id = oc(fullResponse).body.ids.anidb()

    if (isNil(id)) return null

    return Number(id)
  }

  public static async getDeviceCode() {
    const response = await this.getRequest<_OauthCode>('oauth/pin')

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
        this.getRequest<_OauthPinPending | _OauthPinFinished>(
          `oauth/pin/${code}`,
        )

      const intervalId = window.setInterval(async () => {
        const response = await makeRequest()

        if (responseIsError(response) || response.body.result !== 'OK') return

        window.clearInterval(intervalId)
        window.clearInterval(timeoutId)

        const token = response.body.access_token

        const user = await this.getUserInfo(token)

        setSimkl(store, {
          token,
          expires: null,
          user,
        })

        resolve()
      }, interval * 1000)

      const timeoutId = window.setTimeout(() => {
        window.clearInterval(intervalId)
      }, timeout * 1000)
    })
  }

  public static async getUserInfo(token: string) {
    const response = await this.getRequest<_UserSettings>(
      '/users/settings',
      false,
      {},
      token,
    )

    if (responseIsError(response)) {
      throw new Error('Could not get User from Simkl!')
    }

    return {
      name: response.body.user.name,
      id: response.body.account.id,
      url: `https://simkl.com/${response.body.account.id}`,
    }
  }

  public static async disconnect(store: Store<any>) {
    setSimkl(store, null)
  }

  private static async getRequest<
    B extends {} = any,
    Q extends SimklQuery = {}
  >(path: string, full: boolean = false, query: Q = {} as Q, token?: string) {
    if (full) {
      query.extended = 'full'
    }

    return (await superagent
      .get(`${BASE_URL}/${path}`)
      .set('simkl-api-key', this.clientId)
      .auth(token!, { type: 'bearer' })
      .query(query)) as SimklResponse<B>
  }
}

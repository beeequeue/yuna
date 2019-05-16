import superagent from 'superagent/dist/superagent'
import { oc } from 'ts-optchain'

import { getConfig } from '@/config'
import { isNil, RequestError, RequestSuccess } from '@/utils'

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

    const simklId = response.body[0].ids.simkl

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

  private static async getRequest<
    B extends {} = any,
    Q extends SimklQuery = {}
  >(path: string, full: boolean = false, query: Q = {} as Q) {
    if (full) {
      query.extended = 'full'
    }

    return (await superagent
      .get(`${BASE_URL}/${path}`)
      .set('simkl-api-key', this.clientId)
      .query(query)) as SimklResponse<B>
  }
}

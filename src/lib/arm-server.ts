import superagent from 'superagent/dist/superagent'
import { prop, RequestResponse, responseIsError, T } from '../utils'

interface Relation {
  anilist: number | null
  anidb: number | null
  myanimelist: number | null
  kitsu: number | null
}

interface RelationError {
  code: 400 | 404 | 500
  type: string
  messages: string[]
}

export class ArmServer {
  public static async getIdsFor(
    service: 'anilist' | 'anidb' | 'myanimelist' | 'kitsu',
    id: number,
  ) {
    const response = (await superagent
      .get('https://relations.yuna.moe/api/ids')
      .query({ source: service, id })
      .ok(T)) as RequestResponse<Relation, RelationError>

    if (responseIsError(response) || response.status === 204) {
      return null
    }

    return response.body
  }

  public static async batchGetIds(
    options: Partial<Relation>[],
  ): Promise<Array<Relation | null>> {
    const hundreds = Math.ceil(options.length / 100)

    const responses = await Promise.all(
      Array.from({ length: hundreds }).map(
        (_, i) =>
          superagent
            .post('https://relations.yuna.moe/api/ids')
            .send(options.slice(i * 100, (i + 1) * 100))
            .ok(T) as Promise<
            RequestResponse<Array<Relation | null>, RelationError>
          >,
      ),
    )

    if (responses.some(responseIsError)) {
      return options.map(() => null)
    }

    return responses.map(prop('body')).flat()
  }
}

import superagent from 'superagent/dist/superagent'
import { RequestResponse, responseIsError, T } from '../utils'

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

    if (responseIsError(response)) {
      return null
    }

    return response.body
  }
}

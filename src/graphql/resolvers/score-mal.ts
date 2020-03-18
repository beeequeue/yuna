import { AnimeViewAnime } from '@/graphql/generated/types'
import { isNil } from '@/utils'
import { fetchRating } from '@/lib/myanimelist'

export const scoreMalResolver = async (
  media: AnimeViewAnime,
): Promise<number | null> => {
  if (isNil(media) || isNil(media.idMal)) return null

  return fetchRating(media.idMal)
}

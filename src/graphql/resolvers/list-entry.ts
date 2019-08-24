import { AddToListVariables, ListEntryFragment } from '@/graphql/types'

export const AddToList = async (
  _root: undefined,
  { anilistId }: AddToListVariables,
  _cache: { cache: RealProxy },
): Promise<ListEntryFragment> => {
  const promises = window.listPlugins.map(plugin => plugin.AddToList(anilistId))
  const results = await Promise.all(promises)

  return results[0]
}

import { AddToListVariables, DeleteFromListVariables, ListEntryFragment } from '@/graphql/types'

export const AddToList = async (
  _root: undefined,
  { anilistId }: AddToListVariables,
  _cache: { cache: RealProxy },
): Promise<ListEntryFragment> => {
  const promises = window.listPlugins.map(plugin => plugin.AddToList(anilistId))
  const results = await Promise.all(promises)

  return results[0]
}

export const DeleteFromList = async (
  _root: undefined,
  { anilistId }: DeleteFromListVariables,
  _cache: { cache: RealProxy },
): Promise<Boolean> => {
  const promises = window.listPlugins.map(plugin => plugin.DeleteFromList(anilistId))
  const results = await Promise.all(promises)

  return results[0]
}

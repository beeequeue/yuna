import { ListMediaMedia } from '@/graphql/types'

export type ListMedia = {
  [key: number]: { media: ListMediaMedia | null; loading: boolean } | undefined
}

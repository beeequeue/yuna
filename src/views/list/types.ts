import { ListMediaMedia } from '@/graphql/generated/types'

export type ListMedia = {
  [key: number]: { media: ListMediaMedia | null; loading: boolean } | undefined
}

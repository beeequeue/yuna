import { fireEvent } from '@testing-library/vue'
import deepmerge from 'deepmerge'

import { MediaListStatus, Provider } from '@/graphql/generated/types'
import { render } from '@/testing'

import Episode from './episode.vue'
import { EpisodeProps } from './episode.props'

const defaultEpisode: EpisodeProps['episode'] = {
  animeId: 1337,
  title: 'Your favorite episode',
  thumbnail: 'https://picsum.photos/300/175.webp',
  index: 3,
  episodeNumber: 4,
  isWatched: false,
  provider: Provider.Crunchyroll,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders an unwatched, unlisted episode correctly', async () => {
  const props: EpisodeProps = {
    episode: defaultEpisode,
    listEntry: null,
    scrollerValue: null,
    small: false,
  }

  const { getByText, getByTestId, queryByTestId } = render(Episode, props)

  expect(getByTestId('episode')).not.toHaveClass('current')
  expect(queryByTestId('setWatched')).toBeNull()
  expect(getByText('Episode 4')).toBeVisible()
})

test('renders an unwatched, listed episode correctly', async () => {
  const props: EpisodeProps = {
    episode: defaultEpisode,
    listEntry: {
      id: 1337,
      progress: 0,
      status: MediaListStatus.Current,
    },
    scrollerValue: null,
    small: false,
  }

  const { getByText, getByTestId } = render(Episode, props)

  expect(getByTestId('episode')).not.toHaveClass('current')
  expect(getByTestId('setWatched')).toBeVisible()
  expect(getByText('Episode 4')).toBeVisible()
})

test('renders a watched episode correctly', async () => {
  const props: EpisodeProps = {
    episode: {
      ...defaultEpisode,
      isWatched: true,
    },
    listEntry: {
      id: 1337,
      progress: 4,
      status: MediaListStatus.Current,
    },
    scrollerValue: null,
    small: false,
  }

  const { getByText, getByTestId, getByLabelText } = render(Episode, props)

  expect(getByTestId('episode')).not.toHaveClass('current')
  expect(getByTestId('setUnwatched')).toBeVisible()
  expect(getByLabelText('watched')).toBeVisible()
  expect(getByText('Episode 4')).toBeVisible()
})

test('renders a small episode correctly', async () => {
  const props: EpisodeProps = {
    episode: defaultEpisode,
    listEntry: null,
    scrollerValue: null,
    small: true,
  }

  const { getByTestId } = render(Episode, props)

  expect(getByTestId('episode')).toHaveClass('small')
})

test('renders spoiler-hidden episode correctly', async () => {
  const props: EpisodeProps = {
    episode: defaultEpisode,
    listEntry: {
      id: 1337,
      progress: 0,
      status: MediaListStatus.Current,
    },
    scrollerValue: null,
    small: false,
  }

  const { getByText, getByAltText, updateProps } = render(Episode, props, {
    modules: {
      settings: {
        state: {
          spoilers: {
            episode: { name: true, thumbnail: true },
          },
        },
      },
    },
  })

  expect(getByText(defaultEpisode.title)).toHaveClass('blur')
  expect(getByAltText('Episode 4')).toHaveClass('blur')
  expect(getByText('Episode 4')).toBeVisible()

  await updateProps(
    deepmerge(props, {
      episode: { isWatched: true },
      listEntry: { progress: 5 },
    }),
  )

  expect(getByText(defaultEpisode.title)).not.toHaveClass('blur')
  expect(getByAltText('Episode 4')).not.toHaveClass('blur')
})

test('emits click event when clicked', async () => {
  const props: EpisodeProps = {
    episode: defaultEpisode,
    listEntry: {
      id: 1337,
      progress: 0,
      status: MediaListStatus.Current,
    },
    scrollerValue: null,
    small: false,
  }

  const { getByAltText, emitted } = render(Episode, props)

  const container = getByAltText('Episode 4')

  expect(container).toBeVisible()
  await fireEvent.click(container)

  expect(emitted().click).toHaveLength(1)
})

test('emits update-progress event when progress button is clicked', async () => {
  const props: EpisodeProps = {
    episode: defaultEpisode,
    listEntry: {
      id: 1337,
      progress: 0,
      status: MediaListStatus.Current,
    },
    scrollerValue: null,
    small: false,
  }

  const { getByTestId, emitted } = render(Episode, props)

  const container = getByTestId('setWatched')

  expect(container).toBeVisible()
  await fireEvent.click(container)

  expect(emitted()['update-progress']).toHaveLength(1)
})

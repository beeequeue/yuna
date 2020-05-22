import { render } from '@testing-library/vue'
import Nock from 'nock'

import { GitHubRelease } from '@/types'
import releasesJson from '@/../fixtures/github/releases.json'
import Changelog from './changelog.vue'

const hashToLink = (num: number) =>
  `<a href="https://github.com/beeequeue/yuna/issues/${num}" target="_blank">#${num}</a>`

beforeEach(() => {
  jest.clearAllMocks()
  Nock.cleanAll()

  const body: GitHubRelease[] = releasesJson
  Nock('https://api.github.com')
    .get('/repos/beeequeue/yuna/releases')
    .reply(200, [body[0]])
})

test('fetches changelog if not cached', async () => {
  const { getByTestId, findAllByTestId, queryAllByTestId } = render(Changelog)

  expect(getByTestId('version-container')).not.toBeNull()
  expect(queryAllByTestId('version').length).toBe(0)

  const versions = await findAllByTestId('version')
  expect(Nock.pendingMocks().length).toBe(0)
  expect(versions.length).toBe(1)

  expect(versions[0].querySelector('h2')?.innerHTML).toBe(
    releasesJson[0].name.replace(' - ', '<br>'),
  )
  expect(versions[0].querySelector('.body')?.innerHTML).toContain(
    `Local file playback (for real this time) ${hashToLink(614)} ${hashToLink(
      602,
    )}`,
  )
})

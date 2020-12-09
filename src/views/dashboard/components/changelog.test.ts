import { addMinutes } from "date-fns"
import Nock from "nock"

import releasesJson from "@/../fixtures/github/releases.json"
import { LocalStorageKey } from "@/lib/local-storage"
import { mockLocaleStorage, render } from "@/testing"
import { GitHubRelease } from "@/types"
import Changelog from "./changelog.vue"

const hashToLink = (num: number) =>
  `<a href="https://github.com/beeequeue/yuna/issues/${num}" target="_blank">#${num}</a>`

beforeEach(() => {
  jest.clearAllMocks()
  Nock.cleanAll()

  const body: GitHubRelease[] = releasesJson
  Nock("https://api.github.com")
    .get("/repos/beeequeue/yuna/releases")
    .reply(200, body)
})

test("fetches and caches changelog if not cached", async () => {
  const { getByTestId, findAllByTestId, queryAllByTestId } = render(Changelog)

  // Check that it renders while fetching the logs
  expect(getByTestId("version-container")).not.toBeNull()
  expect(queryAllByTestId("version").length).toBe(0)

  // Wait for the fetch and render to finish
  const versions = await findAllByTestId("version")
  const fetchedAt = Date.now()

  expect(Nock.pendingMocks().length).toBe(0)
  expect(versions.length).toBe(5)

  // Assert the rendered elements
  expect(versions[0].querySelector("h2")?.innerHTML).toBe(
    releasesJson[0].name.replace(" - ", "<br>"),
  )
  expect(versions[0].querySelector(".body")?.innerHTML).toContain(
    `Local file playback (for real this time) ${hashToLink(614)} ${hashToLink(
      602,
    )}`,
  )

  // Check that it was cached
  const approximateFetchedAt = Math.floor(
    localStorage[LocalStorageKey.ChangelogFetchedAt] / 1000,
  )

  expect(localStorage[LocalStorageKey.Changelog]).toEqual(
    JSON.stringify(releasesJson.slice(0, 5)), // We cache 5 items
  )

  const approxFetchedAt = Math.floor(fetchedAt / 1000)
  expect(approximateFetchedAt).toBeGreaterThanOrEqual(approxFetchedAt - 5)
  expect(approximateFetchedAt).toBeLessThanOrEqual(approxFetchedAt + 5)
})

test("fetches changelog if cached but stale", async () => {
  mockLocaleStorage({
    [LocalStorageKey.Changelog]: JSON.stringify(releasesJson.slice(3, 5)),
    [LocalStorageKey.ChangelogFetchedAt]: addMinutes(new Date(), -35)
      .getTime()
      .toString(),
  })

  const { findAllByTestId, findByText } = render(Changelog)

  const versions = await findAllByTestId("version")

  // Renders cached data
  expect(versions.length).toBe(2)

  const updatedVersion = await findByText(/v1\.4\.16/)

  expect(Nock.pendingMocks().length).toBe(0)
  expect(updatedVersion).not.toBeNull()
})

test("does not fetch changelog if not stale", async () => {
  mockLocaleStorage({
    [LocalStorageKey.Changelog]: JSON.stringify(releasesJson.slice(3, 5)),
    [LocalStorageKey.ChangelogFetchedAt]: addMinutes(new Date(), 15)
      .getTime()
      .toString(),
  })

  const { findAllByTestId } = render(Changelog)

  const versions = await findAllByTestId("version")

  expect(Nock.pendingMocks().length).toBe(1)
  expect(versions.length).toBe(2)
})

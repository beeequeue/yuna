<template>
  <div class="changelog">
    <h1 class="title">Changelog</h1>

    <div class="versions">
      <section
        v-for="version in changelog"
        :id="version.tag_name"
        :key="version.name"
        class="version"
      >
        <a class="header" :href="version.html_url" target="_blank">
          <h2 v-html="getHeader(version.name)" />
        </a>

        <div class="published-at">{{ formatDate(version.published_at) }}</div>

        <div class="body" v-html="compileMarkdown(version.body)" />
      </section>

      <a href="https://github.com/BeeeQueue/yuna/releases" class="see-more">
        Click here to see the full changelog!
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import marked from 'marked'
import superagent from 'superagent'

import { RequestResponse, responseIsError } from '@/utils'
import { defineComponent, ref, watch } from '@vue/composition-api'

type GitHubRelease = {
  id: number
  tag_name: string
  name: string
  body: string
  url: string
  html_url: string
  draft: boolean
  author: any
  prerelease: boolean
  published_at: string
  assets: any[]
}

type LiteRelease = Pick<
  GitHubRelease,
  'id' | 'tag_name' | 'name' | 'body' | 'html_url' | 'published_at'
>

const CHANGELOG_KEY = 'changelog'
const CHANGELOG_LAST_FETCHED_KEY = 'changelog-fetched'
const CHANGELOG_FETCH_TIMEOUT = 1000 * 60 * 25

const renderer = new marked.Renderer()

renderer.text = (content: string) =>
  content.replace(
    / #(\d+) ?/g,
    (original: string, id: string) =>
      `<a href="https://github.com/beeequeue/yuna/issues/${id}" target="_blank">${original}</a>`,
  )

const fetchChangelog = async () => {
  const response = (await superagent.get(
    'https://api.github.com/repos/beeequeue/yuna/releases',
  )) as RequestResponse<GitHubRelease[]>

  if (responseIsError(response) || !Array.isArray(response.body)) {
    throw new Error('Something went wrong fetching the changelog!')
  }

  const changelog = response.body
    .map<LiteRelease>(
      ({ id, name, body, html_url, tag_name, published_at }) => ({
        id,
        name,
        body,
        html_url,
        tag_name,
        published_at: published_at,
      }),
    )
    .slice(0, 10)

  localStorage.setItem(CHANGELOG_KEY, JSON.stringify(changelog))
  localStorage.setItem(CHANGELOG_LAST_FETCHED_KEY, Date.now().toString())

  return changelog
}

export default defineComponent({
  setup: () => {
    const changelog = ref<LiteRelease[]>(
      JSON.parse(localStorage.getItem(CHANGELOG_KEY) || '[]'),
    )
    const lastFetchedAt = ref(
      Number(localStorage.getItem(CHANGELOG_LAST_FETCHED_KEY) || 0),
    )

    watch(lastFetchedAt, async () => {
      if (lastFetchedAt.value + CHANGELOG_FETCH_TIMEOUT >= Date.now()) {
        return
      }

      changelog.value = await fetchChangelog()
    })

    return {
      changelog,
      getHeader: (str: string) => str.replace(' - ', '<br/>'),
      formatDate: (date: string) =>
        // sv-SE uses YYYY-MM-DD, the only correct way
        Intl.DateTimeFormat('sv-SE').format(new Date(date)),
      compileMarkdown: (str: string) =>
        marked(str, {
          gfm: true,
          renderer,
        }),
    }
  },
})
</script>

<style scoped lang="scss">
@import '../../../colors';

.changelog {
  display: flex;
  flex-direction: column;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  width: 550px;
  max-height: 75%;
  overflow: hidden;

  & > .title {
    border-bottom: 1px solid color($main, 600);
    margin: 0;
    padding: 25px 0;
  }

  & > .versions {
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    & > .see-more {
      padding: 15px;
      font-size: 1.15em;
      border-top: 1px solid color($main, 600);
    }

    & /deep/ a {
      font-weight: 700;
      text-decoration: none;
      color: color($highlight, 400);
      transition: color 0.15s;

      &:hover {
        color: color($highlight, 600);
      }
    }

    & > .version {
      padding: 0 25px 15px;
      border-top: 1px solid color($main, 600);
      box-shadow: inset 0 18px 15px -20px $main, inset 0 -18px 15px -20px $main;

      & > .published-at {
        font-size: 0.85em;
      }

      &:first-child {
        border-top: none;
      }

      & .header {
        color: $white;
        text-decoration: underline;

        & > h2 {
          padding-top: 20px;
          margin-top: 0;
          margin-bottom: 10px;
        }
      }

      & /deep/ ul {
        text-align: left;
      }
    }
  }
}
</style>

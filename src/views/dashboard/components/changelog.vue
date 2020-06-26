<template>
  <div class="changelog">
    <h1 class="title">Changelog</h1>

    <div class="versions" data-testid="version-container">
      <section
        v-for="version in changelog"
        :id="version.tag_name"
        :key="version.name"
        class="version"
        data-testid="version"
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
import { defineComponent, ref, watch } from '@vue/composition-api'

import { LocalStorageKey } from '@/lib/local-storage'
import type { GitHubRelease } from '@/types'
import { RequestResponse, responseIsError } from '@/utils'

type LiteRelease = Pick<
  GitHubRelease,
  'id' | 'tag_name' | 'name' | 'body' | 'html_url' | 'published_at'
>

const CHANGELOG_FETCH_TIMEOUT = 1000 * 60 * 30

const renderer = new marked.Renderer()

const regex = / (#\d+)/g
renderer.text = (content: string) => {
  const matches = content.match(regex) ?? []

  return matches.reduce((accum, match) => {
    const hash = match.trim()
    const id = hash.slice(1)

    return accum.replace(
      match,
      // Keep the space! It's in the regex!
      ` <a href="https://github.com/beeequeue/yuna/issues/${id}" target="_blank">${hash}</a>`,
    )
  }, content)
}

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
        published_at,
      }),
    )
    .slice(0, 5)

  localStorage.setItem(LocalStorageKey.Changelog, JSON.stringify(changelog))
  localStorage.setItem(
    LocalStorageKey.ChangelogFetchedAt,
    Date.now().toString(),
  )

  return changelog
}

export default defineComponent({
  setup: () => {
    const changelog = ref<LiteRelease[]>(
      JSON.parse(localStorage.getItem(LocalStorageKey.Changelog) || '[]'),
    )
    const lastFetchedAt = ref(
      Number(localStorage.getItem(LocalStorageKey.ChangelogFetchedAt) || 0),
    )

    watch(
      lastFetchedAt,
      async () => {
        if (lastFetchedAt.value + CHANGELOG_FETCH_TIMEOUT >= Date.now()) {
          return
        }

        changelog.value = await fetchChangelog()
      },
      {
        immediate: true,
      },
    )

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

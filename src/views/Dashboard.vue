<template>
  <div class="container">
    <div class="changelog">
      <h1>Changelog</h1>

      <section
        v-for="version in changelog"
        class="version"
        :key="version.name"
        :id="version.tag_name"
      >
        <a class="header" :href="version.html_url" target="_blank">
          <h2 v-html="getHeader(version.name)" />
        </a>

        <div class="body" v-html="compileMarkdown(version.body)" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import marked from 'marked'
import superagent from 'superagent'

import CButton from '@/components/CButton.vue'
import { RequestResponse, responseIsError } from '@/utils'

const CHANGELOG_KEY = 'changelog'
const CHANGELOG_LAST_FETCHED_KEY = 'changelog-fetched'
const CHANGELOG_FETCH_TIMEOUT = 1000 * 60 * 60

interface GitHubRelease {
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

const renderer = new marked.Renderer()

renderer.text = (content: string) =>
  content.replace(
    / #(\d+) ?/g,
    (original: string, id: string) =>
      `<a href="https://github.com/beeequeue/yuna/issues/${id}" target="_blank">${original}</a>`,
  )

@Component({ components: { CButton } })
export default class Dashboard extends Vue {
  public changelog: GitHubRelease[] = JSON.parse(
    localStorage.getItem(CHANGELOG_KEY) || '[]',
  )

  public async mounted() {
    const lastFetchedAt = Number(
      localStorage.getItem(CHANGELOG_LAST_FETCHED_KEY) || 0,
    )

    if (lastFetchedAt + CHANGELOG_FETCH_TIMEOUT >= Date.now()) {
      return
    }

    this.fetchChangelog()
  }

  public getHeader(str: string) {
    return str.replace(' - ', '<br/>')
  }

  public compileMarkdown(str: string) {
    return marked(str, {
      gfm: true,
      sanitize: true,
      renderer,
    })
  }

  private async fetchChangelog() {
    const response = (await superagent.get(
      'https://api.github.com/repos/beeequeue/yuna/releases',
    )) as RequestResponse<GitHubRelease[]>

    if (responseIsError(response)) {
      throw new Error('Something went wrong fetching the changelog!')
    }

    localStorage.setItem(CHANGELOG_KEY, JSON.stringify(response.body))
    localStorage.setItem(CHANGELOG_LAST_FETCHED_KEY, Date.now().toString())
    this.changelog = response.body
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.container {
  position: absolute;
  top: 80px;
  bottom: 0;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  & > .changelog {
    background: $dark;
    padding: 10px 25px;
    border-radius: 5px;
    box-shadow: $shadow;

    max-width: 550px;
    max-height: 75%;
    overflow-y: auto;

    & > .version {
      padding-bottom: 15px;
      border-top: 1px solid color($main, 600);
      box-shadow: inset 0 18px 15px -20px $main, inset 0 -18px 15px -20px $main;
    }

    & .header {
      color: $white;
      text-decoration: underline;
    }

    & /deep/ ul {
      text-align: left;
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
  }
}

.route-enter-active,
.route-leave-active {
  transition: none 0.5s; // Required for Vue to realize there are transitions

  & > .changelog {
    transition: opacity 0.5s, transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  & > .changelog {
    opacity: 0;
    transform: translateY(-10%);
  }
}
</style>

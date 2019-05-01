<h3 align="center">
  <a href="https://yuna.moe" target="_blank">
    <img src="public/icons/64x64.png" alt="Yuna"/>
  </a>
</h3>

<p align="center">
  <a href="https://github.com/BeeeQueue/yuna/releases">
    <img src="https://img.shields.io/badge/platforms-win%20%7C%20linux%20%7C%20mac-lightgrey.svg"/>
  </a>

  <a href="https://github.com/BeeeQueue/yuna/releases">
    <img src="https://img.shields.io/github/release-pre/beeequeue/yuna.svg"/>
  </a>
</p>

<p align="center">
  <a href="https://david-dm.org/beeequeue/yuna">
    <img src="https://img.shields.io/david/beeequeue/yuna.svg"/>
  </a>

  <a href="https://travis-ci.org/BeeeQueue/yuna">
    <img src="https://travis-ci.org/BeeeQueue/yuna.svg?branch=master"/>
  </a>

  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg"/>
  </a>
</p>

<h4 align="center">
  <a href="https://yuna.moe" target="_blank">Website</a>
</h4>
<h4 align="center">
  <a href="https://github.com/BeeeQueue/yuna/projects" target="_blank">Roadmap</a>
</h4>
<h4 align="center">
  <a href="https://github.com/BeeeQueue/yuna/releases" target="_blank">Download</a>
</h4>

<p align="center">
  <a href="https://yuna.moe" target="_blank">
    <img src="https://yuna.moe/img/flow/anime.jpg" width="500" alt="Screenshot"/>
  </a>
</p>

## Tech Stack

- Vue + Vuex + Apollo
- TypeScript, SCSS
- Electron

## Development

### Get Started

1. Install dependencies - `yarn`
1. _(Windows only)_ Manually replace the relative path in `apollo.config.js` to an absolute one.
1. Start the development client - `yarn serve`

### Generating types after changing/adding a GraphQL file

`yarn codegen`

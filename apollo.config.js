module.exports = {
  client: {
    includes: ['src/graphql/*.graphql'], // Have to set this to absolute path on Windows https://github.com/apollographql/apollo-tooling/issues/719
    service: {
      name: 'anilist',
      url: 'https://graphql.anilist.co',
    },
  }
}


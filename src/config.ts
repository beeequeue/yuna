const config = {
  all: {
    CRUNCHYROLL_TOKEN: 'LNDJgOit5yaRIWN',
    HIDIVE_TOKEN: '6e6b1afcf0800e2ba312bce28d1dbccc87120904',
    ANIDB_CLIENT: 'application',
    ANIDB_CLIENTVER: '2',
    ANILIST_ID: '913',
    DISCORD_ID: '527978676525072386',
    SIMKL_ID:
      'a47e17953193ad39a3a3c1a6c0b60967de10694476c9d9d277fa51c81f3a5849',
  },
  production: {
    ANILIST_ID: '1410',
  },
}

type Key = keyof typeof config.all | keyof typeof config.production

const isInProdConfig = (key: string): key is keyof typeof config.production =>
  Object.keys(config.production).includes(key)

export const getConfig = <K extends Key>(key: K): string => {
  if (process.env.NODE_ENV === 'production' && isInProdConfig(key)) {
    return config.production[key]
  }

  return config.all[key]
}

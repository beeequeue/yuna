const config = {
  all: {
    CRUNCHYROLL_TOKEN: 'LNDJgOit5yaRIWN',
    HIDIVE_CLIENT: '24i-FireTV',
    HIDIVE_TOKEN: '1f3e6b944a1a260e8cd1a71e058acff75ec7f427',
    ANIDB_CLIENT: 'application',
    ANIDB_CLIENTVER: '2',
    ANILIST_ID: '913',
    DISCORD_ID: '527978676525072386',
    SIMKL_ID:
      'a47e17953193ad39a3a3c1a6c0b60967de10694476c9d9d277fa51c81f3a5849',
  },
  production: {
    ANILIST_ID: '1410',
    FATHOM_URL: 'https://fathom.haglund.dev',
    FATHOM_SITE_ID: 'YTKMF',
  },
}

type Config = typeof config
type AllKey = keyof Config['all']
type ProdKey = keyof Config['production']

const isInProd = (key: string): key is ProdKey =>
  Object.keys(config.production).includes(key)

const isInAll = (key: string): key is AllKey =>
  Object.keys(config.all).includes(key)

export const getConfig = <K extends AllKey | ProdKey>(
  key: K,
): string | null => {
  if (process.env.NODE_ENV === 'production' && isInProd(key)) {
    return config.production[key]
  }

  if (isInAll(key)) {
    return config.all[key]
  }

  return null
}

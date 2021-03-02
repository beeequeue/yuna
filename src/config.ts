const config = {
  all: {
    CRUNCHYROLL_TOKEN: "LNDJgOit5yaRIWN",
    HIDIVE_CLIENT: "24i-Android",
    HIDIVE_TOKEN: "ee32bb768db4ac42fc1d0fcdafb11facb3a8a93a",
    ANIDB_CLIENT: "application",
    ANIDB_CLIENTVER: "2",
    ANILIST_ID: "913",
    DISCORD_ID: "527978676525072386",
    SIMKL_ID: "a47e17953193ad39a3a3c1a6c0b60967de10694476c9d9d277fa51c81f3a5849",
  },
  production: {
    ANILIST_ID: "1410",
  },
}

type Config = typeof config
type AllKey = keyof Config["all"]
type ProdKey = keyof Config["production"]

const isInProd = (key: string): key is ProdKey =>
  Object.keys(config.production).includes(key)

const isInAll = (key: string): key is AllKey => Object.keys(config.all).includes(key)

export const getConfig = <K extends AllKey | ProdKey>(key: K): string | null => {
  if (process.env.NODE_ENV === "production" && isInProd(key)) {
    return config.production[key]
  }

  if (isInAll(key)) {
    return config.all[key]
  }

  return null
}

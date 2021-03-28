import * as Fathom from "fathom-client"

export const initFathom = (version: string) => {
  // Override referrer to be a version string instead
  Object.defineProperty(document, "referrer", {
    get: () => `https://v${version}`,
  })

  Fathom.load("SWBYGOWF", {
    url: "./fathom.js",
    spa: "hash",
  })
}

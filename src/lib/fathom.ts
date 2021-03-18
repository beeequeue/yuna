import * as Fathom from "fathom-client"

export const initFathom = () => {
  Fathom.load("SWBYGOWF", {
    url: "https://mammal.haglund.dev/script.js",
    spa: "hash",
  })
}

console.log('Service worker startups.')

const endsWith = (url, ...strs) => strs.some(str => url.endsWith(str))
const matches = (url, ...regexps) => regexps.some(regex => url.match(regex))

const fromCache = async request => {
  const cache = await caches.open('images')
  const match = await cache.match(request)

  if (!match) return null

  return match
}

const update = async request => {
  const cache = await caches.open('images')
  const response = await fetch(request)

  cache.put(request, response)
  return response
}

self.addEventListener('install', () => {
  console.log('Service worker installed.')

  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  const { url } = event.request
  const isImage = endsWith(url, '.png', '.jpg', '.jpeg', '.gif')
  const isFromCacheableUrl = matches(url, /img\d\.ak\.crunchyroll\.com/, /s\d.anilist.co/)

  if (!isImage || !isFromCacheableUrl) return

  fromCache(event.request).then(match => {
    if (match) {
      try {
        event.respondWith(match)
      } catch (e) {
        // noop
      }
    } else {
      const promise = update(event.request)

      try {
        event.respondWith(promise)
      } catch (e) {
        // noop
      }
    }
  })
})

console.log('Service worker startups.')

const endsWith = (url, ...strs) => strs.some(str => url.endsWith(str))
const includes = (url, ...strs) => strs.some(str => url.includes(str))

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
  const isFromCacheableUrl = includes(url, 'img1.ak.crunchyroll.com', 's3.anilist.co')

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

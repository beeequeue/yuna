import { View } from '@/router'

let missedViews: View[] = []

export const trackView = async (view: View) => {
  if (window.fathom?.trackPageview == null) {
    missedViews.push(view)
    return
  }

  if (missedViews.length > 0) {
    missedViews.forEach(trackView)
    missedViews = []
  }

  window.fathom.trackPageview({
    url: view,
  })
}

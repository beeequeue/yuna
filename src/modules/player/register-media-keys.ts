import { ipcRenderer } from "electron"
import { onMounted, onUnmounted } from "@vue/composition-api"
import {
  PLAYER_NEXT,
  PLAYER_PLAY_PAUSE,
  PLAYER_PREVIOUS,
  PLAYER_STOP,
  REGISTER_MEDIA_KEYS,
  UNREGISTER_MEDIA_KEYS,
} from "@/messages"

type Actions = {
  play: () => void
  pause: () => void
  skipBySeconds: (seconds: number) => void
}

export const registerMediaKeys = (state: { paused: boolean }, actions: Actions) => {
  onMounted(() => {
    ipcRenderer.send(REGISTER_MEDIA_KEYS)

    ipcRenderer.on(PLAYER_PLAY_PAUSE, () =>
      state.paused ? actions.play() : actions.pause(),
    )
    ipcRenderer.on(PLAYER_STOP, actions.pause)

    ipcRenderer.on(PLAYER_NEXT, () => actions.skipBySeconds(10))
    ipcRenderer.on(PLAYER_PREVIOUS, () => actions.skipBySeconds(-10))
  })

  onUnmounted(() => {
    ipcRenderer.send(UNREGISTER_MEDIA_KEYS)

    ipcRenderer.removeAllListeners(PLAYER_PLAY_PAUSE)
    ipcRenderer.removeAllListeners(PLAYER_STOP)
    ipcRenderer.removeAllListeners(PLAYER_NEXT)
    ipcRenderer.removeAllListeners(PLAYER_PREVIOUS)
  })
}

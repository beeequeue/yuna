import Vue from 'vue'
import Composition from '@vue/composition-api'

jest.mock('electron-util', () => ({
  api: { app: { getPath: () => 'USER_DATA_PATH' } },
}))

Vue.use(Composition)

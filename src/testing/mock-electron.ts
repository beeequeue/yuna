import type Electron from 'electron'
import { DeepPartial } from '@/types'

jest.mock(
  'electron',
  (): DeepPartial<typeof Electron> => ({
    ipcRenderer: {
      on: () => null as any,
    },
    remote: {
      BrowserWindow: ({} as Partial<Electron.BrowserWindow>) as any,
    },
  }),
)

jest.mock('electron-util', () => ({
  api: { app: { getPath: () => 'USER_DATA_PATH' } },
}))

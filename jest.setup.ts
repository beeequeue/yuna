jest.mock('electron-util', () => ({
  api: { app: { getPath: () => 'USER_DATA_PATH' } },
}))

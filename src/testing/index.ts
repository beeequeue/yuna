export function mockLocaleStorage(mock: Record<string, any>): void {
  for (const key in mock) {
    if (mock.hasOwnProperty(key)) {
      localStorage.__STORE__[key] = mock[key]
    }
  }
}

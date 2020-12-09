import Store from "electron-store"
import { mocked } from "ts-jest/utils"

jest.mock("electron-store")

const mockedStore = mocked(Store)

class MockStore<O extends Record<PropertyKey, any>> {
  private store: O = {} as any

  get = <K extends keyof O>(key: K, defaultValue?: O[K]) =>
    this.store[key] ?? defaultValue!

  set = <K extends keyof O>(key: K, value: O[K]) => {
    this.store[key] = value
  }

  delete = <K extends keyof O>(key: K) => {
    delete this.store[key]
  }

  has = (key: keyof O) => key in this.store

  clear = () => {
    this.store = {} as any
  }

  get size() {
    return Object.keys(this.store).length
  }

  path = "PATH_TO_STORE"
}

mockedStore.mockImplementation((): any => new MockStore())

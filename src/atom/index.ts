import { inject, InjectionKey, Ref, ref } from '@vue/composition-api'

const AtomsSymbol: InjectionKey<Record<symbol, unknown>> = Symbol('Settings')

const atoms = {} as Record<string, Ref<unknown>>

export const AtomProvider = {
  [AtomsSymbol as symbol]: atoms,
}

type AtomOptions<K extends string, T> = {
  key: K
  initial: T
}

export type Atom<K extends string = string, _T = any> = {
  symbol: symbol
  key: K
}

export const atom = <K extends string, T>({
  key,
  initial,
}: AtomOptions<K, T>): Atom<K, T> => {
  const symbol = Symbol(key)

  // Can't type keys properly with symbols :(
  // https://github.com/Microsoft/TypeScript/issues/24587#issuecomment-460650063
  atoms[(symbol as unknown) as string] = ref(initial)

  return {
    key,
    symbol,
  }
}

export const useAtom = <K extends string, T>(atom: Atom<K, T>): Ref<T> => {
  const key = (atom.symbol as unknown) as string
  const atoms = inject(AtomsSymbol, {} as Record<string, Ref<unknown>>)

  return atoms[key] as Ref<T>
}

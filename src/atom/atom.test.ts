import Vue from 'vue'
import { fireEvent, render } from '@testing-library/vue'

import { Atom, atom, AtomProvider, useAtom } from '@/atom'
import { Ref } from '@vue/composition-api'

const createVisualizer = (atomToTest: Atom) =>
  Vue.component('visualizer', {
    setup: () => ({ result: useAtom(atomToTest) }),
    template:
      '<pre data-testid="visualizer">{{ JSON.stringify(result) }}</pre>',
  })

const createButton = <T>(
  atomToTest: Atom<string, T>,
  setFunc: (value: Ref<T>) => void,
) =>
  Vue.component('increment-button', {
    setup: () => {
      const result = useAtom(atomToTest)

      const set = () => {
        setFunc(result)
      }

      return { result, set }
    },
    template: '<button @click="set">Increment</button>',
  })

test('can read and write to simple atom', async () => {
  const countAtom = atom({
    key: 'count',
    initial: 0,
  })

  const Visualizer = createVisualizer(countAtom)
  const Button = createButton(countAtom, ref => {
    ref.value += 1
  })

  const Test = Vue.component('test', {
    components: { Visualizer, Button },
    template: `
      <div>
      <visualizer/>
      <increment-button/>
      </div>
    `,
  })

  const { getByTestId, getByText } = render(Test, {
    provide: {
      ...AtomProvider,
    },
  })

  const visualizer = getByTestId('visualizer')
  const button = getByText('Increment')

  expect(visualizer.textContent).toBe('0')

  await fireEvent.click(button)

  expect(visualizer.textContent).toBe('1')
})

test('can read and write to complex atom', async () => {
  const arrayAtom = atom({
    key: 'ids',
    initial: ['one'],
  })

  const Visualizer = createVisualizer(arrayAtom)
  const Button = createButton(arrayAtom, ref => {
    ref.value.push('two', 'three')
  })

  const Test = Vue.component('test', {
    components: { Visualizer, Button },
    template: `
      <div>
      <visualizer/>
      <increment-button/>
      </div>
    `,
  })

  const { getByTestId, getByText } = render(Test, {
    provide: {
      ...AtomProvider,
    },
  })

  const visualizer = getByTestId('visualizer')
  const button = getByText('Increment')

  expect(visualizer.textContent).toBe(JSON.stringify(['one']))

  await fireEvent.click(button)

  expect(visualizer.textContent).toBe(JSON.stringify(['one', 'two', 'three']))
})

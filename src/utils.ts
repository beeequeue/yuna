import { Response } from 'superagent'
import { Prop as IProp, PropOptions } from 'vue/types/options'

export interface RequestSuccess<B extends object> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<B extends object> extends Response {
  status: 200 | 400 | 401 | 404 | 500 | 502
  ok: false
  body: B
}

export const secondsToTimeString = (input: number) => {
  const minutes = Math.floor(input / 60)
  const seconds = input - minutes * 60

  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`
}

export const prop = (type: IProp<any>, required?: boolean): PropOptions => ({
  type,
  required: !!required,
})

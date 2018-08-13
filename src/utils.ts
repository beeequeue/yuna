import { Response } from 'superagent'

export interface RequestSuccess<B extends object = any> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<
  S extends number = 400 | 404 | 500,
  B extends object = any
> extends Response {
  status: S | 500
  ok: false
  body: B
}

import superagent from 'superagent'
import uuid from 'uuid/v4'
import { RequestSuccess, RequestError } from './../utils'

// tslint:disable:variable-name
const API_URL = 'api.crunchyroll.com'
const VERSION = '0'
const access_token = process.env.ACCESS_TOKEN
const device_type = 'com.crunchyroll.windows.desktop'
const device_id = `NANI-${uuid()}`
// tslint:enable:variable-name

interface CrunchyrollError {
  error: true
  code: string
  message: string
}

export interface CrunchyrollUser {
  class: 'user'
  user_id: number
  etp_guid: string
  username: string
  email: string
  first_name: string
  last_name: string
  premium?: string
  is_publisher: false
  access_type: 'premium' | string
  created: Date | string
}

interface LoginSuccess {
  data: {
    user: CrunchyrollUser
    auth: string
    expires: Date
  }
  error: false
  code: 'ok'
}

export const createSession = async () => {
  const sessionResponse = await superagent
    .post(`https://${API_URL}/start_session.${VERSION}.json`)
    .query({ access_token, device_type, device_id })

  if (sessionResponse.body.error) {
    return Promise.reject(sessionResponse.body)
  }

  return sessionResponse.body.data.session_id
}

export const login = async (
  username: string,
  password: string,
  sessionId: string,
) => {
  const data = new FormData()
  data.append('account', username)
  data.append('password', password)
  data.append('session_id', sessionId)

  const response = (await superagent
    .post(`https://${API_URL}/login.${VERSION}.json`)
    .send(data)) as
    | RequestSuccess<LoginSuccess>
    | RequestError<200, CrunchyrollError>

  if (response.body.error) {
    return Promise.reject(response.body)
  }

  return response.body.data
}

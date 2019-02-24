import { format } from 'date-fns'
import superagent from 'superagent/superagent'
import crypto from 'crypto'
import { ActionContext, Store } from 'vuex'

import { isOfType, RequestError, RequestSuccess } from '@/utils'
import { getConfig } from '@/config'
import { getHidiveLogin, getIsConnectedTo, setHidive } from '@/state/auth'
import { EpisodeListEpisodes, Provider } from '@/graphql/types'

const API_URL = 'api.hidive.com'
const TOKEN = getConfig('HIDIVE_TOKEN')
const DEVICE_NAME = 'Android'
const APP_ID = '24i-Android'

let deviceId = ''
let visitId = ''
let ipAddress = ''
let profile = {
  userId: 0,
  profileId: 0,
}

enum _ResponseCode {
  Success = 0,
  InvalidNonce = 5,
  InvalidSignature = 6,
  InvalidVisitId = 8,
  InvalidEmail = 29,
}

// @ts-ignore
enum _Locale {
  Japanese = 'jpn',
  English = 'eng',
  Spanish = 'spa',
  SpanishEU = 'spa-eu',
  SpanishLatAm = 'spa-la',
  French = 'fre',
  German = 'ger',
  Korean = 'kor',
  Portuguese = 'por',
  Turkish = 'tur',
  Italian = 'ita',
}

export interface HidiveProfile {
  AvatarJPGUrl: string
  AvatarPNGUrl: string
  Id: number
  Nickname: string
  PinEnabled: boolean
  Primary: boolean
}

interface _Title {
  ContinueWatching: {
    CreatedDT: string
    CurrentTime: number
    EpisodeId: number
    Id: string
    ModifiedDT: string | null
    ProfileId: number
    SeasonId: number
    Status: string | null
    TitleId: number
    TotalSeconds: number
    UserId: number
    VideoId: number
  }
  EpisodeCount: number
  Episodes: _Episode[]
  FirstPremiereDate: string
  Id: number
  InQueue: boolean
  IsContinueWatching: boolean
  IsFavorite: boolean
  IsRateable: boolean
  KeyArtUrl: string
  LoadTime: number
  LongSynopsis: string
  MasterArtUrl: string
  MediumSynopsis: string
  Name: string
  OverallRating: number
  Rating: string
  RokuHDArtUrl: string
  RokuSDArtUrl: string
  RunTime: number
  SeasonName: string
  ShortSynopsis: string
  ShowInfoTitle: string
  UserRating: number
}

interface _Episode {
  DisplayNameLong: string
  EpisodeNumberValue: number
  HIDIVEPremiereDate: string
  Id: number
  LoadTime: number
  Name: string
  Number: number
  ScreenShotCompressedUrl: string
  ScreenShotSmallUrl: string
  SeasonNumber: number
  SeasonNumberValue: number
  Summary: string
  TitleId: number
  VideoKey: string
}

interface InitDeviceBody {
  DeviceId: string
  VisitId: string
}

interface AuthenticateBody {
  Profiles: HidiveProfile[]
  User: {
    CountryCode: string | null
    CountryName: string | null
    Email: string
    Id: number
    NextBillDate: string | null
    ServiceLevel: 'Gold' | string
  }
}

interface GetTitleBody {
  Title: _Title
}

interface ReqResponse {
  Code: _ResponseCode
  Data: any
  IPAddress: string
  Message: string | null
  Messages: {} | any
  Status: 'Success' | 'InvalidNonce' | string
  Timestamp: string
}

interface HidiveSuccess<D extends object = any> extends ReqResponse {
  Code: 0
  Data: D
  IPAddress: string
  Message: null
  Messages: {}
  Status: 'Success'
}

interface HidiveError extends ReqResponse {
  Data: any
  Status: 'InvalidNonce' | string
}

type HidiveResponse<D extends object = any> =
  | RequestSuccess<HidiveSuccess<D>>
  | RequestError<HidiveError>

enum RequestType {
  Ping = 'Ping',
  InitDevice = 'InitDevice',
  Authenticate = 'Authenticate',
  GetTitle = 'GetTitle',
}

type StoreType = Store<any> | ActionContext<any, any>

export class Hidive {
  public static get profile() {
    return profile
  }

  public static get visitId() {
    return visitId
  }

  public static get ipAddress() {
    return ipAddress
  }

  public static async createVisit(store: StoreType) {
    const ping = await this.request<{}>(RequestType.Ping)
    if (!ping.ok || ping.body.Code !== 0) {
      throw new Error(ping.body.Message!)
    }

    ipAddress = ping.body.IPAddress

    const init = await this.request<InitDeviceBody>(RequestType.InitDevice, {
      DeviceName: DEVICE_NAME,
    })
    if (!init.ok || init.body.Code !== 0) {
      throw new Error(init.body.Status)
    }

    deviceId = init.body.Data.DeviceId
    visitId = init.body.Data.VisitId

    if (getIsConnectedTo(store).hidive) {
      try {
        this.authenticate({ store })
      } catch (e) {
        this.disconnect(store)
      }
    }
  }

  public static async connect(
    store: StoreType,
    user: string,
    password: string,
  ) {
    const response = await this.authenticate({ user, password })

    setHidive(store, {
      login: {
        user,
        password: password,
      },
      profiles: response.body.Data.Profiles,
      user: {
        id: response.body.Data.User.Id,
        name: response.body.Data.Profiles[0].Nickname,
        profile: response.body.Data.Profiles[0].Id,
        url: null,
      },
    })
  }

  public static async fetchEpisodesByUrl(anilistId: number, url: string) {
    const response = await superagent.get(url)
    if (!response.ok) {
      throw new Error('Could not scrape info from Hidive.')
    }

    const idMatch = response.text.match(/data-json='{"titleID":\s+?(\d+),/)
    if (!idMatch || !idMatch[1]) {
      return []
    }

    const id = Number(idMatch[1])

    return this.fetchEpisodesById(anilistId, id)
  }

  public static async fetchEpisodesById(anilistId: number, id: number) {
    const response = await this.request<GetTitleBody>(RequestType.GetTitle, {
      Id: id,
    })

    if (!response.ok || response.body.Code !== 0) {
      throw new Error(response.body.Status)
    }

    const title = response.body.Data.Title

    return title.Episodes.map<Omit<EpisodeListEpisodes, 'isWatched'>>(
      (ep, index) => ({
        __typename: 'Episode',
        provider: Provider.Hidive,
        id: ep.Id,
        animeId: anilistId,
        title: ep.Name,
        duration: title.RunTime * 60,
        progress: null,
        index,
        episodeNumber: ep.EpisodeNumberValue,
        url: `https://hidive.com/tv/${this.convertName(title.Name)}/${
          ep.VideoKey
        }`,
        thumbnail: ep.ScreenShotSmallUrl,
      }),
    )
  }

  public static async disconnect(store: StoreType) {
    setHidive(store, null)

    this.authenticate({ store })
  }

  public static async request<D extends object = any>(
    type: RequestType,
    body?: any,
  ) {
    const nonce = this.generateNonce()
    const signature = this.generateSignature(nonce, body)

    return (await superagent
      .post(`https://${API_URL}/api/v1/${type}`)
      .set({
        'X-ApplicationId': APP_ID,
        'X-DeviceId': deviceId,
        'X-VisitId': visitId,
        'X-UserId': profile.userId,
        'X-ProfileId': profile.profileId,
        'X-Nonce': nonce,
        'X-Signature': signature,
      })
      .send(body)) as HidiveResponse<D>
  }

  private static async authenticate(
    options: { store: StoreType } | { user: string; password: string },
  ) {
    let user = ''
    let password = ''

    if (isOfType<{ store: StoreType }>(options, 'store')) {
      const login = getHidiveLogin(options.store)
      user = login.user
      password = login.password
    } else {
      user = options.user
      password = options.password
    }

    const response = await this.request<AuthenticateBody>(
      RequestType.Authenticate,
      {
        Email: user,
        Password: password,
      },
    )

    if (!response.ok || response.body.Code !== 0) {
      throw new Error(response.body.Message!)
    }

    return response
  }

  private static getUTCDate(date = new Date()) {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
  }

  private static generateNonce() {
    const date = format(this.getUTCDate(), 'yyMMddHHmm')

    const nonce = date + TOKEN

    const hashedNonce = crypto
      .createHash('sha256')
      .update(nonce)
      .digest('hex')

    return hashedNonce
  }

  private static generateSignature(nonce: string, body: any) {
    const sigCleanStr =
      ipAddress +
      APP_ID +
      deviceId +
      visitId +
      profile.userId +
      profile.profileId +
      JSON.stringify(body) +
      nonce +
      TOKEN

    return crypto
      .createHash('sha256')
      .update(sigCleanStr)
      .digest('hex')
  }

  private static convertName(name: string) {
    return name
      .replace(/[^a-zA-Z\d]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-/, '')
      .replace(/-$/, '')
      .toLowerCase()
  }
}

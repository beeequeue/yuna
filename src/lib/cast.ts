import Bonjour from 'bonjour'
import { Client, DefaultMediaReceiver } from 'castv2-client'
import { oc } from 'ts-optchain'
import { isNil } from '@/utils'

interface KnownCastDevice {
  name: string
  ip: string
  port: number
  current: string | null
}

const bonjour = Bonjour()

const chromecasts: KnownCastDevice[] = []

export class Cast {
  public client = new Client()
  public connected = false
  public ip: string

  constructor(ip: string) {
    this.ip = ip

    this.client.connect(ip, () => {
      console.log('connected')

      this.client.getSessions(console.log)
    })

    this.client.on('error', err => {
      console.log('Error: %s', err.message)
      this.client.close()
    })
  }

  public static refreshCastDevices() {
    return new Promise<void>(resolve => {
      bonjour.find({ type: 'googlecast' }, service => {
        const ip = (service as any).addresses[0]
        const name = oc(service.txt as any).fn()

        if (!isNil(name) && !chromecasts.some(device => device.ip === ip)) {
          chromecasts.push({
            ip,
            port: service.port,
            name,
            current: oc(service.txt as any).rs(),
          })
        }

        console.log(chromecasts)

        setTimeout(() => {
          bonjour.destroy()
          resolve()

          const cast = new Cast(chromecasts[0].ip)
        }, 3000)
      })
    })
  }

  public static get castDevices() {
    return chromecasts
  }

  public async connect() {}
}

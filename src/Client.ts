import { EventEmitter } from "events"
import { Duplex } from "stream"
import * as Base58 from "bs58"
//import * as Debug from "debug"
import Debug from "debug"
import * as Msg from "./Msg"
import WebSocket from "./WebSocket"
import Peer, { Info } from "./ClientPeer"

Debug.formatters.b = Base58.encode

const log = Debug("discovery-cloud:Client")

export interface Options {
  id: Buffer
  url: string
  stream: (info: Info) => Duplex
  [k: string]: unknown
}

export default class DiscoveryCloudClient extends EventEmitter {
  connect: (info: Info) => Duplex
  id: string
  selfKey: Buffer
  url: string
  channels: Set<string> = new Set()
  peers: Map<string, Peer> = new Map()
  discovery: WebSocket

  constructor(opts: Options) {
    super()

    this.selfKey = opts.id
    this.id = Base58.encode(opts.id)
    this.url = opts.url
    this.connect = opts.stream
    this.discovery = this.connectDiscovery()

    log("Initialized %o", opts)
  }

  join(channelBuffer: Buffer) {
    log("join %b", channelBuffer)

    const channel = Base58.encode(channelBuffer)
    this.channels.add(channel)

    if (this.discovery.readyState === WebSocket.OPEN) {
      this.send({
        type: "Join",
        id: this.id,
        join: [channel],
      })
    }
  }

  leave(channelBuffer: Buffer) {
    log("leave %b", channelBuffer)

    const channel = Base58.encode(channelBuffer)
    this.channels.delete(channel)
    this.peers.forEach((peer) => {
      if (peer.has(channel)) peer.close(channel)
    })

    if (this.discovery.readyState === WebSocket.OPEN) {
      this.send({
        type: "Leave",
        id: this.id,
        leave: [channel],
      })
    }
  }

  listen(_port: unknown) {
    // NOOP
  }

  private connectDiscovery(): WebSocket {
    const url = `${this.url}/discovery/${this.id}`

    log("connectDiscovery", url)

    this.discovery = new WebSocket(url)

    this.discovery.addEventListener("open", () => {
      this.sendHello()
    })

    this.discovery.addEventListener("close", () => {
      log("discovery.onclose... reconnecting in 5s")
      setTimeout(() => {
        this.connectDiscovery()
      }, 5000)
    })

    this.discovery.addEventListener("message", event => {
      const data = Buffer.from(event.data)
      log("discovery.ondata", data)
      this.receive(JSON.parse(data.toString()))
    })

    this.discovery.addEventListener("error", (event: any) => {
      console.error("discovery.onerror", event.error)
    })

    return this.discovery
  }

  private sendHello() {
    this.send({
      type: "Hello",
      id: this.id,
      join: [...this.channels],
    })
  }

  private send(msg: Msg.ClientToServer) {
    log("discovery.send %o", msg)
    this.discovery.send(JSON.stringify(msg))
  }

  private receive(msg: Msg.ServerToClient) {
    log("discovery.receive %o", msg)

    switch (msg.type) {
      case "Connect":
        this.onConnect(msg.peerId, msg.peerChannels)
        break
    }
  }

  private onConnect(id: string, channels: string[]) {
    const peer = this.peer(id)

    const newChannels = channels.filter(ch => !peer.connections.has(ch))

    newChannels.forEach(channel => {
      peer.add(channel)
    })
  }

  private peer(id: string): Peer {
    const existing = this.peers.get(id)
    if (existing) return existing

    log("creating peer %s", id)

    const url = `${this.url}/connect/${this.id}`
    const peer = new Peer({ url, id, stream: this.connect })
    this.peers.set(id, peer)

    return peer
  }
}

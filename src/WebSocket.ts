//import * as WebSocket from "ws"
import WebSocket from "ws"


// This file is only imported by node, but not webpack
export default class WebSocket2 extends WebSocket {
  constructor(url: string) {
    super(url)
    this.binaryType = "arraybuffer"
  }
}

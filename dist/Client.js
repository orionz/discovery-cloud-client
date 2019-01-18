"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Base58 = __importStar(require("bs58"));
//import * as Debug from "debug"
const debug_1 = __importDefault(require("debug"));
const WebSocket_1 = __importDefault(require("./WebSocket"));
const ClientPeer_1 = __importDefault(require("./ClientPeer"));
debug_1.default.formatters.b = Base58.encode;
const log = debug_1.default("discovery-cloud:Client");
class DiscoveryCloudClient extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.channels = new Set();
        this.peers = new Map();
        this.selfKey = opts.id;
        this.id = Base58.encode(opts.id);
        this.url = opts.url;
        this.connect = opts.stream;
        this.discovery = this.connectDiscovery();
        log("Initialized %o", opts);
    }
    join(channelBuffer) {
        log("join %b", channelBuffer);
        const channel = Base58.encode(channelBuffer);
        this.channels.add(channel);
        if (this.discovery.readyState === WebSocket_1.default.OPEN) {
            this.send({
                type: "Join",
                id: this.id,
                join: [channel],
            });
        }
    }
    leave(channelBuffer) {
        log("leave %b", channelBuffer);
        const channel = Base58.encode(channelBuffer);
        this.channels.delete(channel);
        this.peers.forEach((peer) => {
            if (peer.has(channel))
                peer.close(channel);
        });
        if (this.discovery.readyState === WebSocket_1.default.OPEN) {
            this.send({
                type: "Leave",
                id: this.id,
                leave: [channel],
            });
        }
    }
    listen(_port) {
        // NOOP
    }
    connectDiscovery() {
        const url = `${this.url}/discovery/${this.id}`;
        log("connectDiscovery", url);
        this.discovery = new WebSocket_1.default(url);
        this.discovery.addEventListener("open", () => {
            this.sendHello();
        });
        this.discovery.addEventListener("close", () => {
            log("discovery.onclose... reconnecting in 5s");
            setTimeout(() => {
                this.connectDiscovery();
            }, 5000);
        });
        this.discovery.addEventListener("message", event => {
            const data = Buffer.from(event.data);
            log("discovery.ondata", data);
            this.receive(JSON.parse(data.toString()));
        });
        this.discovery.addEventListener("error", (event) => {
            console.error("discovery.onerror", event.error);
        });
        return this.discovery;
    }
    sendHello() {
        this.send({
            type: "Hello",
            id: this.id,
            join: [...this.channels],
        });
    }
    send(msg) {
        log("discovery.send %o", msg);
        this.discovery.send(JSON.stringify(msg));
    }
    receive(msg) {
        log("discovery.receive %o", msg);
        switch (msg.type) {
            case "Connect":
                this.onConnect(msg.peerId, msg.peerChannels);
                break;
        }
    }
    onConnect(id, channels) {
        const peer = this.peer(id);
        const newChannels = channels.filter(ch => !peer.connections.has(ch));
        newChannels.forEach(channel => {
            peer.add(channel);
        });
    }
    peer(id) {
        const existing = this.peers.get(id);
        if (existing)
            return existing;
        log("creating peer %s", id);
        const url = `${this.url}/connect/${this.id}`;
        const peer = new ClientPeer_1.default({ url, id, stream: this.connect });
        this.peers.set(id, peer);
        return peer;
    }
}
exports.default = DiscoveryCloudClient;
//# sourceMappingURL=Client.js.map
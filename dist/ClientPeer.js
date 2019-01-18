"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const Base58 = __importStar(require("bs58"));
const WebSocketStream_1 = __importDefault(require("./WebSocketStream"));
const log = debug_1.default("discovery-cloud:ClientPeer");
class ClientPeer {
    constructor({ url, id, stream }) {
        this.connections = new Map(); // channel -> socket
        this.url = url;
        this.id = id;
        this.stream = stream;
    }
    has(channel) {
        return this.connections.has(channel);
    }
    add(channel) {
        if (this.connections.has(channel))
            return;
        const url = [this.url, this.id, channel].join("/");
        const tag = [this.id.slice(0, 2), channel.slice(0, 2)].join("-");
        const socket = new WebSocketStream_1.default(url, tag);
        this.connections.set(channel, socket);
        const protocol = this.stream({
            channel: Base58.decode(channel),
            discoveryKey: Base58.decode(channel),
            live: true,
            download: true,
            upload: true,
            encrypt: false,
            hash: false,
        });
        socket.ready.then(socket => protocol.pipe(socket).pipe(protocol));
        protocol.on("error", err => {
            log("protocol.onerror %s", tag, err);
        });
        socket.on("error", err => {
            log("socket.onerror %s", tag, err);
        });
        socket.once("end", () => {
            log("socket.onend");
            this.remove(channel);
        });
        socket.once("close", () => {
            log("socket.onclose");
            this.remove(channel);
        });
    }
    close(channel) {
        const socket = this.connections.get(channel);
        if (socket) {
            log("%s closing socket: %s", this.id, channel);
            socket._destroy(null, () => { });
            this.connections.delete(channel);
        }
    }
    remove(channel) {
        log("%s removing connection: %s", this.id, channel);
        this.connections.delete(channel);
    }
}
exports.default = ClientPeer;
//# sourceMappingURL=ClientPeer.js.map
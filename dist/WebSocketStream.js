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
const stream_1 = require("stream");
const crypto = __importStar(require("crypto"));
const WebSocket_1 = __importDefault(require("./WebSocket"));
class WebSocketStream extends stream_1.Duplex {
    constructor(url, tag) {
        super();
        this.tag = tag || crypto.randomBytes(2).toString("hex");
        this.log = debug_1.default(`discovery-cloud:wsStream-${this.tag}`);
        this.socket = new WebSocket_1.default(url);
        this.ready = new Promise(resolve => {
            this.socket.addEventListener("open", () => {
                this.log("socket.onopen");
                this.emit("open", this);
                resolve(this);
            });
        });
        this.socket.addEventListener("close", () => {
            this.log("socket.onclose");
            this.destroy(); // TODO is this right?
        });
        this.socket.addEventListener("error", err => {
            this.log("socket.onerror", err);
            this.emit("error", err);
        });
        this.socket.addEventListener("message", event => {
            const data = Buffer.from(event.data);
            this.log("socket.onmessage", data);
            if (!this.push(data)) {
                this.log("closed, cannot write");
                this.socket.close();
            }
        });
    }
    get isOpen() {
        return this.socket.readyState === WebSocket_1.default.OPEN;
    }
    _write(data, _, cb) {
        if (this.isOpen) {
            this.socket.send(data);
            cb();
        }
        else {
            cb(new Error(`socket[${this.tag}] is closed, cannot write.`));
        }
    }
    _read() {
        // Reading is done async
    }
    _destroy(err, cb) {
        this.log("_destroy", err);
        super._destroy(err, cb);
        this.socket.close();
    }
}
exports.default = WebSocketStream;
//# sourceMappingURL=WebSocketStream.js.map
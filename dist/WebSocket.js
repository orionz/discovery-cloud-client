"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import * as WebSocket from "ws"
const ws_1 = __importDefault(require("ws"));
// This file is only imported by node, but not webpack
class WebSocket2 extends ws_1.default {
    constructor(url) {
        super(url);
        this.binaryType = "arraybuffer";
    }
}
exports.default = WebSocket2;
//# sourceMappingURL=WebSocket.js.map
/// <reference types="node" />
import Debug from "debug";
import { Duplex } from "stream";
import WebSocket from "./WebSocket";
export default class WebSocketStream extends Duplex {
    socket: WebSocket;
    ready: Promise<this>;
    tag: string;
    log: Debug.IDebugger;
    constructor(url: string, tag?: string);
    readonly isOpen: boolean;
    _write(data: Buffer, _: unknown, cb: (error?: Error) => void): void;
    _read(): void;
    _destroy(err: Error | null, cb: (error: Error | null) => void): void;
}

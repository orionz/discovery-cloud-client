/// <reference types="node" />
import { EventEmitter } from "events";
import { Duplex } from "stream";
import WebSocket from "./WebSocket";
import Peer, { Info } from "./ClientPeer";
export interface Options {
    id: Buffer;
    url: string;
    stream: (info: Info) => Duplex;
    [k: string]: unknown;
}
export default class DiscoveryCloudClient extends EventEmitter {
    connect: (info: Info) => Duplex;
    id: string;
    selfKey: Buffer;
    url: string;
    channels: Set<string>;
    peers: Map<string, Peer>;
    discovery: WebSocket;
    constructor(opts: Options);
    join(channelBuffer: Buffer): void;
    leave(channelBuffer: Buffer): void;
    listen(_port: unknown): void;
    private connectDiscovery;
    private sendHello;
    private send;
    private receive;
    private onConnect;
    private peer;
}

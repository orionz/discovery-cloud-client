/// <reference types="node" />
import { Duplex } from "stream";
import WebSocketStream from "./WebSocketStream";
export interface Info {
    channel: Buffer;
    discoveryKey: Buffer;
    live?: boolean;
    download?: boolean;
    upload?: boolean;
    encrypt?: boolean;
    hash?: boolean;
}
interface Options {
    id: string;
    url: string;
    stream: (info: Info) => Duplex;
}
export default class ClientPeer {
    id: string;
    url: string;
    stream: (info: Info) => Duplex;
    connections: Map<string, WebSocketStream>;
    constructor({ url, id, stream }: Options);
    add(channel: string): void;
    remove(channel: string): void;
}
export {};

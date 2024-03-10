import { WebSocket } from "ws";

export interface ActiveConnections {
  [id: string]: WebSocket;
}

export interface IncomingAction {
  type: string;
  payload: string;
}

export interface Pixel {
  x: number;
  y: number;
}

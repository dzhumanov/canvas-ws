import { WebSocket } from "ws";

export interface ActiveConnections {
  [id: string]: WebSocket;
}

export interface IncomingAction {
  type: string;
  payload: Pixel[];
}

interface DrawAction {
  type: "DRAW";
  payload: Pixel[];
}

export interface Pixel {
  x: number;
  y: number;
}

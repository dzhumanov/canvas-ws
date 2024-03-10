import cors from "cors";
import express from "express";
import expressWs from "express-ws";
import { ActiveConnections, IncomingAction } from "./types";
import crypto from "crypto";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};

let canvas: string[] = [];

router.ws("/canvas", (ws, req) => {
  const id = crypto.randomUUID();
  console.log("Client connected id=", id);
  activeConnections[id] = ws;

  ws.send(
    JSON.stringify({
      type: "WELCOME",
      payload: "Hello, you have connected to the canvas!",
    })
  );

  ws.send(
    JSON.stringify({
      type: "CURRENT",
      payload: canvas,
    })
  );

  ws.on("message", (paint) => {
    const parsedMessage = JSON.parse(paint.toString()) as IncomingAction;
    if (parsedMessage.type === "DRAW") {
      canvas.push(parsedMessage.payload);
      broadcastCanvas(canvas);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected", id);
    delete activeConnections[id];
  });
});

function broadcastCanvas(canvas: string[]) {
  Object.values(activeConnections).forEach((connection) => {
    const outgoingData = {
      type: "NEW_DATA",
      payload: canvas,
    };
    connection.send(JSON.stringify(outgoingData));
  });
}

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});

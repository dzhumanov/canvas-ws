import cors from "cors";
import express from "express";
import expressWs from "express-ws";
import { ActiveConnections, IncomingAction } from "./types";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};
router.ws("/canvas", (ws, req) => {
  const id = crypto.randomUUID();
  console.log("Client connected id=", id);
  activeConnections[id] = ws;
  let canvas: string[] = [];

  ws.send(
    JSON.stringify({
      type: "WELCOME",
      payload: "Hello, you have connected to the canvas!",
    })
  );

  ws.on("message", (paint) => {
    const parsedMessage = JSON.parse(paint.toString()) as IncomingAction;
    if (parsedMessage.type === "DRAW") {
      canvas.push(parsedMessage.payload);
      Object.values(activeConnections).forEach((connection) => {
        const outgoingData = {
          type: "NEW_DATA",
          payload: canvas,
        };
        connection.send(JSON.stringify(outgoingData));
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected", id);
    delete activeConnections[id];
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});

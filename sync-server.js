import { WebSocketServer } from "ws";

const PORT = 8765;
const wss = new WebSocketServer({ port: PORT });

let latestState = null;

wss.on("connection", (ws) => {
  console.log("Client connected. Total:", wss.clients.size);

  // Send the latest state to new clients so OBS picks up current data
  if (latestState) {
    ws.send(latestState);
  }

  ws.on("message", (data) => {
    const msg = data.toString();
    latestState = msg;

    // Broadcast to all OTHER connected clients
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(msg);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected. Total:", wss.clients.size);
  });
});

console.log(`Sync server running on ws://localhost:${PORT}`);

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Room management
interface RoomClient {
  ws: WebSocket;
  playerIndex: number;
  name: string;
}

interface Room {
  id: string;
  clients: RoomClient[];
  p1Config?: { style: string; ev: any };
  p2Config?: { style: string; ev: any };
}

const rooms = new Map<string, Room>();

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentPlayerIndex: number | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'join') {
        const roomId = (msg.roomId || '').trim().toUpperCase();
        if (!roomId) return;

        let room = rooms.get(roomId);
        if (!room) {
          room = { id: roomId, clients: [] };
          rooms.set(roomId, room);
        }

        // Check if room is full
        if (room.clients.length >= 2) {
          ws.send(JSON.stringify({ type: 'error', message: '部屋が満員です（定員2名）' }));
          return;
        }

        const playerIndex = room.clients.length === 0 ? 0 : 1;
        const clientInfo: RoomClient = {
          ws,
          playerIndex,
          name: msg.name || `${playerIndex + 1}P`
        };

        room.clients.push(clientInfo);
        currentRoomId = roomId;
        currentPlayerIndex = playerIndex;

        // Notify client of their role
        ws.send(JSON.stringify({
          type: 'joined',
          roomId,
          playerIndex,
          playersCount: room.clients.length,
          p1Config: room.p1Config,
          p2Config: room.p2Config
        }));

        // Broadcast to other client in the room
        room.clients.forEach((c) => {
          if (c.ws !== ws && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({
              type: 'player_joined',
              playersCount: room.clients.length,
              playerIndex
            }));
          }
        });
      }

      else if (msg.type === 'config') {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;

        if (msg.playerIndex === 0) room.p1Config = { style: msg.style, ev: msg.ev };
        if (msg.playerIndex === 1) room.p2Config = { style: msg.style, ev: msg.ev };

        // Relay config to other players
        room.clients.forEach((c) => {
          if (c.ws !== ws && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({
              type: 'config',
              playerIndex: msg.playerIndex,
              style: msg.style,
              ev: msg.ev
            }));
          }
        });
      }

      else if (msg.type === 'start') {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;

        room.clients.forEach((c) => {
          if (c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({ type: 'start' }));
          }
        });
      }

      else {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;

        // Fast relay to other player in the room
        room.clients.forEach((c) => {
          if (c.ws !== ws && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(data.toString());
          }
        });
      }

    } catch (err) {
      console.error('WS message error:', err);
    }
  });

  const cleanup = () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.clients = room.clients.filter((c) => c.ws !== ws);

    if (room.clients.length === 0) {
      rooms.delete(currentRoomId);
    } else {
      room.clients.forEach((c) => {
        if (c.ws.readyState === WebSocket.OPEN) {
          c.ws.send(JSON.stringify({
            type: 'player_left',
            leftPlayerIndex: currentPlayerIndex,
            playersCount: room.clients.length
          }));
        }
      });
    }
  };

  ws.on('close', cleanup);
  ws.on('error', cleanup);
});

async function start() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch(console.error);

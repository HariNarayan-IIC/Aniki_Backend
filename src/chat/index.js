import { Server } from "socket.io";
import chatHandler from "./chatHandler.js";
import { allowedOrigins } from "../app.js";
import { authenticateSocket } from "./socketAuth.js";

export function setupSocket(server) {
  console.log("Inside setupSocket");
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS for Socket.IO"));
      },
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    chatHandler(io, socket);
  });
}

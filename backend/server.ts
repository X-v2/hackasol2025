import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { startRace } from "./engine.ts";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let running = false;

app.post("/start-race", (req, res) => {
  if (running) return res.status(400).send({ ok: false, msg: "Race already running" });
  running = true;
  startRace(io);
  io.once("race_finished", () => (running = false));
  res.send({ ok: true });
});

io.on("connection", s => console.log("Client connected:", s.id));

server.listen(3001, () => console.log("Backend running on :3001"));


require('dotenv').config()
const express = require('express');
const fs = require('fs');
const { ethers } = require('ethers');
const cors = require('cors');
const { Server } = require("socket.io");
const http = require('http');
const { startRace } = require('./engine');

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';
const PORT = process.env.PORT || 3001;

const ABI = JSON.parse(
  fs.readFileSync('./artifacts/contracts/TurboRacers.sol/TurboRacers.json')
).abi;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const contractWithSigner = wallet ? contract.connect(wallet) : null;

const app = express();
app.use(cors())
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});



io.on("connection", s => {
  console.log("Client connected:", s.id)
  s.on("disconnect", () => {
    console.log("client disconnected:", s.id);
  });
}
);

async function raceLoop() {
  while (true) {
    console.log("Starting race...");

    // Start your race
    await startRace(io, contract, {
      track: "monaco",
      condition: "dry"
    });

    // After race ends: countdown to the next one
    for (let s = 5; s > 0; s--) {
      io.emit("race_event", {
        type: "next_race_in",
        seconds: s
      });

      await new Promise(r => setTimeout(r, 1000));
    }
  }
}



app.get('/racers', async (req, res) => {
  try {
    const ids = await contract.getAllRacerIds();

    const racers = [];
    for (const idBN of ids) {
      const id = idBN.toNumber();
      const r = await contract.getRacer(id);

      racers.push({
        id: r[0].toNumber(),
        owner: r[1],
        name: r[2],
        speed: r[3],
        aggression: r[4],
        consistency: r[5],
        handling: r[6],
        tyreManagement: r[7],
        currentPrice: r[8].toString()
      });
    }

    res.json(racers);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'failed to fetch racers' });
  }
});

app.post('/update-price', async (req, res) => {
  try {
    if (req.header('x-admin-token') !== ADMIN_SECRET)
      return res.status(403).send({ error: 'forbidden' });

    if (!contractWithSigner)
      return res.status(500).send({ error: 'no signer configured' });

    const { id, price } = req.body;
    if (id == null || price == null)
      return res.status(400).send({ error: 'missing fields' });

    const tx = await contractWithSigner.updatePrice(id, price);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'failed to update price' });
  }
});

server.listen(PORT, () => {
  console.log(`API running on ${PORT}`);

    raceLoop();
}
);

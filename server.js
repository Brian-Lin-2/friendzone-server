const { createServer } = require("node:http");
const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = createServer(app);

const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");

// Middleware.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up passport-jwt. We will be using jwt tokens for user auth.
require("./misc/passportSetup");

// Routes.
app.use("/user", userRoute);
app.use("/message", messageRoute);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

module.exports = io;

async function startDatabase() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("connected to database");
}
startDatabase().catch((err) => console.log(err));

server.listen(3000, () => console.log("server started on port 3000"));

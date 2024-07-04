const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const userRoute = require("./routes/userRoute");

// Middleware.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up passport-jwt. We will be using jwt tokens for user auth.
require("./misc/passportSetup");

// Routes.
app.use("/user", userRoute);

async function startDatabase() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("connected to database");
}
startDatabase().catch((err) => console.log(err));

app.listen(3000, () => console.log("server started on port 3000"));

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from "body-parser";
const app = express();

require("dotenv").config();

// MongoDB URI | Special
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}cluster0-zlxgj.mongodb.net/${process.env.MONGODB_DB_NAME}`;

// Imported Routes
const authRoutes = require("./routes/authRoutes");
import apiRoutes from "./routes/apiRoutes";

// Setting up json parser
app.use(bodyParser.json());

// Serving static files with express
app.use(express.static("public"));

// Setting up api access permissions
app.use((req: any, res: { setHeader: (arg0: string, arg1: string) => void; }, next: () => void) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// Setting up routes with some default
app.use("/auth", authRoutes);
app.use('/api', apiRoutes);

// Setting up special error middleware
app.use((err: { status: number; message: any; }, req: any, res: { status: any; send: (arg0: { type: string; status: any; message: any; }) => void; }, next: () => void) => {
  res.status = err.status || 500;
  res.send({
    type: "error",
    status: err.status || 500,
    message: err.message,
  });
});

// Setting up connection to MongoDB
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(uri).then(() => {
  const server = app.listen(5000);

  // Setting up connection to Socket.io
  const io = require("./socket")(server);

  app.set("socket.io", io);

  console.log("Sever listening to 5000");
});

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from "body-parser";
// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUi, {SwaggerOptions} from "swagger-ui-express";


require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB URI | Special
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}cluster0-zlxgj.mongodb.net/${process.env.MONGODB_DB_NAME}`;

// Imported Routes
import authRoutes from "./routes/authRoutes";
import apiRoutes from "./routes/apiRoutes";
import labelRoutes from "./routes/labelRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import swaggerRoutes from "./routes/swaggerRoutes";

// const swaggerOptions: SwaggerOptions = {
//   swaggerDefinition: {
//     info: {
//       title: 'DND Todo React Api',
//       description: 'Fully fledged todo application built on top of the react.',
//       contact: {
//         name: 'DNDeveloper'
//       },
//       servers: ['http://localhost:' + port]
//     }
//   },
//   apis: ['./routes/*.ts']
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Setting up api access permissions
app.use((req: any, res: { setHeader: (arg0: string, arg1: string) => void; }, next: () => void) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// Setting up json parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Serving static files with express
app.use(express.static("public"));

// Setting up routes with some default

app.use("/auth", authRoutes);
app.use('/api', apiRoutes);
app.use('/label', labelRoutes);
app.use('/project', projectRoutes);
app.use('/task', taskRoutes);
// app.use(swaggerRoutes);

// Setting up special error middleware
app.use((err: { status: number; message: any; errorKey?: string }, req: any, res: { status: any; send: (arg0: { errorKey: string | undefined; type: string; message: any; status: number }) => void; }, next: () => void) => {
  res.status = err.status || 500;
  res.send({
    type: "error",
    status: err.status || 500,
    message: err.message,
    errorKey: err.errorKey
  });
});

// Setting up connection to MongoDB
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(uri, { useFindAndModify: false }).then(() => {
  const server = app.listen(port);

  // Setting up connection to Socket.io
  // const io = require("./socket.ts")(server);
  // const io = require("./socket")(server);

  const io = {};

  // const job = schedule.scheduleJob('*/606060 * * * *', function() {
  //   console.log('[app.ts || Line no. 119 ....]', 'Running thousand time');
  // })

  app.set("socket.io", io);

  console.log("Sever listening to " + process.env.PORT || 5000);
});


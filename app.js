require("dotenv").config();
const connectDatabase = require("./src/connections/index");
const { responseHandler } = require("./src/middlewares/responses");
const routes = require("./src/routes");
const socket = require("./src/services/socket");
const groupSocket = require("./src/services/groupSocket");
const bodyParser = require("body-parser");
const Controller = require("./src/controllers");


const http = require("http");


const express = require("express");
const { JWT_VERIFY } = require("./src/middlewares/auth");
const app = express();
const server = http.createServer(app)

app.use(responseHandler);
app.post("/webhook",bodyParser.raw({type:'application/json'}),Controller.product.webhooks)

app.use("/upload", express.static("upload"))
app.use(express.json());
app.use("/api", routes);

server.listen(process.env.PORT, () => {
    console.log(`server started at ${process.env.PORT}`)
    connectDatabase();
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
   // socket(io);
    groupSocket(io);
}
)

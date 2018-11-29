const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const httpServer = require("http").Server(app);
const io = require("socket.io")(httpServer);

const { usernames } = require("./constants/globals");
const { log } = require("./logger");

// constant;
const CONNECTION = "connection";

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());
app.use(cors({ origin: true }));

// welcome page;
app.get("/", function(req, res) {
  res.sendFile(`${__dirname}/index.html`);
});

app.post("/exists", function(req, res, next) {
  try {
    const { username } = req.body;
    const result =
      usernames.map(i => i.username).indexOf(username) === -1 ? "ok" : "exists";
    log(`Username ${username} ${result}, sending back status`);
    res.send({
      status: result
    });
  } catch (e) {
    next(e);
  }
});

const { onConnectionListener } = require("./handlers/connection");
io.on(CONNECTION, onConnectionListener);

const closeListener = () => {
  log("Activating exit sequence");
  io.close();
  httpServer.close(() => {
    process.exit();
  });
};

process.on("SIGTERM", closeListener);
process.on("SIGINT", closeListener);

process.on("exit", () => {
  log("Exit sequence has been completed");
});

const port = 3001;

httpServer.listen(port, () => {
  log(`Listening port *: ${port}`);
});

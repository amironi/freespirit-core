require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const http = require("http").createServer(app);
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(morgan("dev"));

require("./ioSocket")(http, app);

const port = process.env.PORT || 4000;

// console.log("cluster", process.env.cluster);
// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID,
//   key: process.env.PUSHER_KEY,
//   secret: process.env.PUSHER_SECRET,
//   cluster: process.env.cluster,
//   useTLS: true,
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

http.listen(port, () => console.log(`server listening on port ${port}`));

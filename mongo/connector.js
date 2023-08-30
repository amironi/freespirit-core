const mongoose = require("mongoose");
const { VERIFY, NETWORK } = require("../services/Utils");
mongoose.Promise = global.Promise;

const RETRY_TIMEOUT = 3000;
let isConnectedBefore = false;

// const options = {
//   autoReconnect: true,
//   useMongoClient: true,
//   keepAlive: 30000,
//   reconnectInterval: RETRY_TIMEOUT,
//   reconnectTries: 10000,
// };

VERIFY(NETWORK, "NETWORK is required");

mongoose.connection.myConnect = function () {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    })
    .catch((err) =>
      console.error("Mongoose connect(...) failed with err: ", err)
    );
};
mongoose.set("strictQuery", true);
// connect();

mongoose.connection.on("error", function () {
  console.error("Could not connect to MongoDB");
});

mongoose.connection.on("disconnected", function () {
  console.log("Lost MongoDB connection...", new Date().toLocaleString());
  // if (!isConnectedBefore) {
  //   setTimeout(() => connect(), RETRY_TIMEOUT);
  // }
});
mongoose.connection.on("connected", function () {
  isConnectedBefore = true;
  console.log(
    "Connection established to MongoDB",
    NETWORK,
    new Date().toLocaleString()
  );
});

mongoose.connection.on("reconnected", function () {
  console.log("Reconnected to MongoDB", new Date().toLocaleString());
});

// // Close the Mongoose connection, when receiving SIGINT
// process.on("SIGINT", function () {

//   console.log("close mongoose ", new Date().toLocaleString());

//   mongoose.connection.close(function () {
//     console.warn("Force to close the MongoDB connection after SIGINT");
//     process.exit(0);
//   });
// });

module.exports = mongoose.connection;

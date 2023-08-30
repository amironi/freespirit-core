const paints = {};
const chats = {};

module.exports = function (http, app) {
  app.get("/count", (req, res) => {
    console.log("count", Object.keys(paints).length);
    res.json(Object.keys(paints).length);
  });

  const io = require("socket.io")(http, {
    cors: {
      origin: "*",
    },
  });

  console.log("ioSocket");

  io.on("connection", (socket) => {
    console.log("connection", socket.id);

    socket.on("onConnectNewWindow", (group) => {
      try {
        console.log("onConnectNewWindow:", group);

        paints[group]?.forEach((paint) => {
          socket.emit("onPaint", paint);
        });

        chats[group]?.forEach((chat) => {
          socket.emit("onChat", chat);
        });
      } catch (error) {
        console.error("onConnectNewWindow", error.message);
      }
    });

    socket.on("paint", (body) => {
      try {
        console.log("paint", body.group);

        paints[body.group] ??= [];
        paints[body.group].push(body);
        socket.broadcast.emit("onPaint", body);
      } catch (error) {
        console.error("paint", error.message);
      }
    });
    socket.on("chat", (body) => {
      try {
        console.log("chat", body.group);

        chats[body.group] ??= [];
        chats[body.group].push(body);

        socket.broadcast.emit("onChat", body);
      } catch (error) {
        console.error("chat", error.message);
      }
    });

    socket.on("disconnect", () => {
      if (socket.wallet) {
        console.log(`disconnect ${socket.wallet.getAddress()}`);
      }
    });
  });
};

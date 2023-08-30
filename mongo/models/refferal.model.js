const mongoose = require("mongoose");

const RefferalSchema = mongoose.model(
  "Refferal",
  new mongoose.Schema({
    refferal: String,
    wallet: String,
  })
);

module.exports = RefferalSchema;

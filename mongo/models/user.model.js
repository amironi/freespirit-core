const mongoose = require("mongoose");

const UserSchema = mongoose.model(
  "User",
  new mongoose.Schema({
    email: String,
    phone: String,
    password: String,
    country: String,
    refferal: String,
    secret: String,
    verified: Boolean,
    created: Date,
    data: {},
    // membership: Boolean,
    // roles: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Role",
    //   },
    // ],
  })
);

module.exports = UserSchema;

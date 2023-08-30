const mongoose = require("mongoose");

const InboxSchema = mongoose.model(
  "Inbox",
  new mongoose.Schema({
    created: Date,
    from: String,
    subject: String,
    body: {},
    read: Boolean,
  })
);

module.exports = InboxSchema;

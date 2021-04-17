const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    message: { type: String, required: [true, "Message is required"] },
    opened: { type: Boolean, required: false, default: false },
    receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
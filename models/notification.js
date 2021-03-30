const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    initiator: {type: Schema.Types.ObjectId, required: false, ref: "Account"},
    page: { type:  Schema.Types.ObjectId, ref: "Page"},
    message: {type: String, required: [true, "Message is required"]},
    openned: {type: Boolean, required: false, default: false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    initiator: { type: Schema.Types.ObjectId, required: false, ref: "Account" },
    page: { type: Schema.Types.ObjectId, required: true, ref: "Page" },
    booking: { type: Schema.Types.ObjectId, required: true, ref: "Booking" },
    type: { type: String, enum: ["page", "page-message", "page-booking", "booking", "booking-message"], required: true },
    message: { type: String, required: [true, "Message is required"] },
    openned: { type: Boolean, required: false, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");
const notification = require("./notification");

const Schema = mongoose.Schema;

const NotificationGroup = new Schema(
    {
        receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
        mainReceiver: { type: Schema.Types.ObjectId, required: false, ref: "Account" },
        page: { type: Schema.Types.ObjectId, required: true, ref: "Page" },
        booking: { type: Schema.Types.ObjectId, required: true, ref: "Booking" },
        type: { type: String, enum: ["page", "page-message", "page-booking", "booking", "booking-message"], required: true },
        notifications: [{ type: Schema.Types.ObjectId, required: true, ref: "Notification" }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("NotificationGroup", NotificationGroup);
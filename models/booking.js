const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");
const { selectedService } = require("./commonSchemas/selectedService");

const Schema = mongoose.Schema;

const booking = new Schema(
    {
        tourist: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
        pageId: { type: String, required: true },
        bookingInfo: [Component],
        selectedServices: [selectedService],
        bookingType: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Booked', 'Rejected', 'Unfinished'], required: false, default: 'Unfinished' }
    },
    { timestamps: true }
);

module.exports = mongoose.model("booking", booking);

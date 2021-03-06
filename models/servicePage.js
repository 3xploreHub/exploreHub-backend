const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const servicePage = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    hostTouristSpot: { type: String, required: true, ref: 'TouristSpotPage'},
    components: [Component],
    services: [Component],
    bookingInfo: [Component], 
    approved: { type: Boolean, required: false, default: true }

  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicePage", servicePage);

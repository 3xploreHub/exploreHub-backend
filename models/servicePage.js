const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const servicePage = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    hostTouristSpot: { type:  Schema.Types.ObjectId, required: true, ref: 'TouristSpotPage'},
    components: [Component],
    services: [Component],
    bookingInfo: [Component], 
    status: { type: String, enum : ['Unfinished','Pending', 'Online', 'Rejected', 'Not Operating'], required: false, default: 'Unfinished' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicePage", servicePage);

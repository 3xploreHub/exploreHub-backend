const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");
const { service } = require("./service");

const Schema = mongoose.Schema;

const touristSpotPageSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    components: [Component],
    services: [service],
    bookingInfo: [Component], 
    status: { type: String, enum : ['Unfinished','Pending', 'Online', 'Rejected', 'Not operating'], required: false, default: 'Online' }

  },
  { timestamps: true }
);

module.exports = mongoose.model("TouristSpotPage", touristSpotPageSchema);

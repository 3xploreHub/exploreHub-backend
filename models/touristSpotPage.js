const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const touristSpotPageSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    components: [Component],
    services: [Component],
    bookingInfo: [Component], 
    status: { type: String, enum : ['unfinished','pending', 'approved', 'rejected', 'not_operating'], required: false, default: 'unfinished' }

  },
  { timestamps: true }
);

module.exports = mongoose.model("TouristSpotPage", touristSpotPageSchema);

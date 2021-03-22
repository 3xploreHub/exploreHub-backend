const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const Page = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    hostTouristSpot: { type:  Schema.Types.ObjectId, ref: "Page"},
    pageType: {type:String, required: true},
    components: [Component],
    services: [Component],
    otherServices: [{type:Schema.Types.ObjectId}],
    bookingInfo: [Component],
    status: { type: String, enum : ['Unfinished','Pending', 'Online', 'Rejected', 'Not Operating'], required: false, default: 'Unfinished' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", Page);

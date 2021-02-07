const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const touristSpotPageSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    // name: {
    //   type: String,
    //   trim: true,
    //   required: [false, "Tourist spot's name is required"],
    // },
    category: {
      type: Schema.Types.ObjectId,
      ref: "TouristSpotCategory",
      required: [false, "Tourist spot's category is required"],
    },
    // coverPhoto: {
    //   type: String,
    //   required: false,
    // },
    // address: {
    //   barangay: {
    //     type: String,
    //     required: [false, "Barangay is required"],
    //     set: (value) => {
    //       const tempVal = value.trim().toLowerCase();
    //       return tempVal.charAt(0).toUpperCase() + tempVal.slice(1);
    //     },
    //   },
    //   municipality: {
    //     type: String,
    //     required: [false, "Municipality is required"],
    //     set: (value) => {
    //       const tempVal = value.trim().toLowerCase();
    //       return tempVal.charAt(0).toUpperCase() + tempVal.substring(1);
    //     },
    //   },
    //   city: {
    //     type: String,
    //     required: [false, "City is required"],
    //     set: (value) => {
    //       const tempVal = value.trim().toLowerCase();
    //       return tempVal.charAt(0).toUpperCase() + tempVal.slice(1);
    //     },
    //   },
    // },
    // description: {
    //   type: String,
    //   trim: true,
    //   required: [false, "Tourist spot's description is required"],
    // },
    components: [Component],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TouristSpotPage", touristSpotPageSchema);

const mongoose = require("mongoose");
const { ExtraService } = require("./commonSchemas/extraService");
const { OtherFacility } = require("./commonSchemas/otherFacility");
const { Regulation } = require("./commonSchemas/regulation");
const { Room } = require("./commonSchemas/room");
const { Feature } = require("./commonSchemas/feature");

const Schema = mongoose.Schema;

const touristSpotSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    name: {
      type: String,
      trim: true,
      required: [true, "Tourist spot's name is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "TouristSpotCategory",
      required: [true, "Tourist spot's category is required"],
    },
    coverPhoto: {
      type: String,
      required: false,
    },
    completeAddress: {
      type: String,
      required: [true, "Tourist spot's location is required"],
    },
    address: {
      barangay: {
        type: String,
        required: [true, "Barangay is required"],
        set: (value) => {
          const tempVal = value.trim().toLowerCase();
          return tempVal.charAt(0).toUpperCase() + tempVal.slice(1);
        },
      },
      municipality: {
        type: String,
        required: [true, "Municipality is required"],
        set: (value) => {
          const tempVal = value.trim().toLowerCase();
          return tempVal.charAt(0).toUpperCase() + tempVal.substring(1);
        },
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        set: (value) => {
          const tempVal = value.trim().toLowerCase();
          return tempVal.charAt(0).toUpperCase() + tempVal.slice(1);
        },
      },
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Tourist spot's description is required"],
    },
    zipcode: { type: Number, required: false },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    rooms: [Room],
    features: [Feature],
    regulations: [Regulation],
    extraServices: [ExtraService],
    otherFacilities: [OtherFacility],
    tourServiceContributors: [
      {
        tourServiceId: {
          type: Schema.Types.ObjectId,
          ref: "TourService",
        },
      },
    ],
    lodgingServiceContributors: [
      {
        lodgeServiceId: {
          type: Schema.Types.ObjectId,
          ref: "LodgeService",
        },
      },
    ],
    transportationServiceContributors: [
      {
        transportationServiceId: {
          type: Schema.Types.ObjectId,
          ref: "TransportationService",
        },
      },
    ],
    approved: { type: Boolean, required: false, default: false }
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("TouristSpot", touristSpotSchema);

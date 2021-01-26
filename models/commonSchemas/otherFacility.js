const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const OtherFacility = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Facility's name is required"],
  },
  description: {
    type: String,
    required: [true, "Facility's description is required"],
    trim: true,
  },
  images: [{ type: String, required: false }],
  price: { type: String, required: false },
  quantity: { type: Number, required: false },
});

OtherFacility.statics.validate = async function (otherFacility) {
  return await schemaValidator(this, otherFacility);
};

module.exports.OtherFacility = OtherFacility;
module.exports.otherFacilityModel = mongoose.model(
  "otherFacilityModel",
  OtherFacility
);

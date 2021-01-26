const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const ExtraService = new Schema({
  name: { type: String, required: [true, "Extra service name is required"] },
  price: { type: String, required: false },
  description: { type: String, required: false },
  quantity: { type: Number, require: false },
});

ExtraService.statics.validate = async function (extraService) {
  return await schemaValidator(this, extraService);
};

module.exports.ExtraService = ExtraService;
module.exports.extraServiceModel = mongoose.model(
  "extraServiceModel",
  ExtraService
);

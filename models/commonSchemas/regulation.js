const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Regulation = new Schema({
  title: { type: String, required: [true, "Regulation's title is required"] },
  description: {
    type: String,
    required: [true, "Regulation's description is required"],
  },
  consequence: { type: String, required: false },
});

Regulation.statics.validate = async function (regulation) {
  return await schemaValidator(this, regulation);
};

module.exports.Regulation = Regulation;
module.exports.regulationModel = mongoose.model("Regulation", Regulation);

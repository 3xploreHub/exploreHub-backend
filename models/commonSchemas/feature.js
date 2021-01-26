const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Feature = new Schema({
  photo: { type: String, required: [true, "Feature's photo is required"] },
  caption: {
    type: String,
    required: [true, "Feature's caption is required"],
  },
});

Feature.statics.validate = async function (Feature) {
  return await schemaValidator(this, Feature);
};

module.exports.Feature = Feature;
module.exports.FeatureModel = mongoose.model("Feature", Feature);

const mongoose = require("mongoose");
const schemaValidator = require("../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Item = new Schema({
  type: { type: String, required: [true, "Item type is required"] },
  styles: { type: Array, required: false },
  data: { type: Object, required: [true, "Item data is required"] },
  default: { type: Boolean, required: false, default: false }
});

Item.statics.validate = async function (Item) {
  return await schemaValidator(this, Item);
};

module.exports.Item = mongoose.model(
  "Item",
  Item
);

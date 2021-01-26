const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Room = new Schema({
  roomCategory: {
    type: String,
    required: [true, "Room's category is required"],
  },
  bedCapacity: {
    type: Number,
    required: [true, "Room's bed capacity is required"],
  },
  quantity: { type: Number, required: [true, "Room's quantity is required"] },
  price: { type: String, required: [true, "Room's price is required."] },
  images: [{ type: String, required: false }],
  billingMethod: {
    type: String,
    required: [true, "Room's billing method is required."],
    enum: ["per head", "per night"],
  },
  description: { type: String, required: false },
});

Room.statics.validate = async function (room) {
  return await schemaValidator(this, room);
};

module.exports.Room = Room;
module.exports.roomModel = mongoose.model("roomModel", Room);

const mongoose = require("mongoose");
const { message } = require("./commonSchemas/message");

const Schema = mongoose.Schema;

const Conversation = new Schema(
  {
    page: { type: Schema.Types.ObjectId, required: true, ref: "Page" },
    booking: { type: Schema.Types.ObjectId, required: true, ref: "Booking" },
    messages: [message],
    receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    opened: { type: Boolean, required: false, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", Conversation);
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const selectedService = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "ComponentModel", required: true },
    serviceName: { type: String, required: true },
    serviceGroupId: { type: Schema.Types.ObjectId, required: true },
    otherData: { type: Object, required: false }
  },
);

module.exports.selectedService = selectedService;
module.exports.selectedServiceModel = mongoose.model("selectedServiceModel", selectedService);

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const MY_SECRET = process.env.MY_SECRET;

const Schema = mongoose.Schema;

const Accountchema = new Schema(
  {
    accountType: {
      type: String,
      required: true,
      enum: ["Service Provider", "Tourist", "Admin"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    contactNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true, trim: true },
    firstName: { type: String, required: false, lowercase: true, trim: true },
    lastName: { type: String, required: false, lowercase: true, trim: true },
    address: { type: String, required: false, lowercase: true, trim: true },
    fullName: { type: String, required: false, lowercase: true, trim: true },
    gender: { type: String, required: false },
    age: { type: Number, required: false },
  },
  { timestamps: true }
);

Accountchema.statics.login = async function (credential) {
  return await this.findOne({ credential: credential });
};

Accountchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id });
};

Accountchema.statics.checkContactNumber = async function (value) {
  return await this.findOne({ contactNumber: value });
};

Accountchema.statics.checkEmail = async function (value) {
  return await this.findOne({ email: value });
};

Accountchema.statics.getUserInfo = async function (id) {
  return this.findOne(
    { _id: id },
    "accountType fullName email contactNumber age gender address",
    function (err, accountInfo) {
      if (err) {
        return err;
      }
      return accountInfo;
    }
  );
};

Accountchema.statics.changePassword = async function (id, password) {
  return await this.findByIdAndUpdate(
    id,
    { $set: { password: password } },
    { upsert: true },
    function (err, doc) {
      if (err) return err;
      return doc;
    }
  );
};

Accountchema.statics.generateJwt = function (user, type) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      type: type,
    },
    MY_SECRET
  );
};

module.exports = mongoose.model("Account", Accountchema);

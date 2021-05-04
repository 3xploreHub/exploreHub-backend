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
    firstName: { type: String, required: false, trim: true, set: name => {
      if (name.length > 1) {
        return name[0].toUpperCase()+name.substring(1)
      }
      return name.toUpperCase()
    }},

    middleName: { type: String, required: false, trim: true, set: name => {
      if (name.length > 1) {
        return name[0].toUpperCase()+name.substring(1)
      }
      return name.toUpperCase()
    }},
    
    lastName: { type: String, required: false,  trim: true, set: name => {
      if (name.length > 1) {
        return name[0].toUpperCase()+name.substring(1)
      }
      return name.toUpperCase()
    }},
    address: { type: String, required: false, trim: true },
    fullName: { type: String, required: false, trim: true },
    gender: { type: String, required: false },
    age: { type: Number, required: false },
    birthday: { type: String, required: false},
    profile: { type: String, required: false}
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
    // "accountType fullName email contactNumber age gender address",
    "accountType fullName firstName lastName middleName email contactNumber age gender address birthday password profile",
    function (err, accountInfo) {
      if (err) {
        return err;
      }
      return accountInfo;
    }
  );
};

Accountchema.statics.updateUserInfo = async function (id, data) {
  return await this.findByIdAndUpdate(
    id, 
    data,
    { upsert: true },
    function (err, doc) {
      if(err) return err;
      return doc;
    }
  )
}

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
      fullName: user.fullName,
      accountType: user.accountType,
      gender: user.gender,
      type: type,
    },
    MY_SECRET
  );
};

Accountchema.statics.addProfile = function (id, profile) {
  return this.findByIdAndUpdate(
    id,
    { $set: { profile: profile } },
    { upsert: true },
    function (err, doc) {
      if (err) return err;
      return doc;
    }
  );
}

module.exports = mongoose.model("Account", Accountchema);

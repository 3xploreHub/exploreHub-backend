const Account = require("../../models/account");
const bcrypt = require("bcryptjs");
const userTokenType = require("./userTokenType");

//host/api/account/getUserInformation
//getting user information
module.exports = async (req, res) => {
  try {

    console.log("REQUEST BODY PROFILE: ", req.body)
    console.log("REQUEST USER: ", req.user)

    console.log("file: :",req.file)

    const userAddProfile = await Account.addProfile(req.user._id, req.file.filename );
    if (!userAddProfile) {
      return res.status(404).json({ message: "Failed to add profile!" });
    }
    res.status(200).json(userAddProfile);
  } catch (error) {
    console.error("error in getting user information: ", error);    
    res.status(400).json(error.message);
  }
};
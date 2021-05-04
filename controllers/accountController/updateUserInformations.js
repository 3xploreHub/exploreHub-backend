const Account = require("../../models/account");
const VerificationCode = require("../../models/VerificationCode");

//host/api/account/getUserInformation
//getting user information
module.exports = async (req, res) => {
  try {
    await VerificationCode.deleteMany({ expiryDate: { $lt: new Date() } });

    const userAccountUpdate = await Account.updateUserInfo(req.user._id, req.body);
    if (!userAccountUpdate) {
      return res.status(404).json({ message: "Failed to update user account!" });
    }

    res.status(200).json(userAccountUpdate);
  } catch (error) {
    console.error("error in getting user information: ", error);
    res.status(400).json(error.message);
  }
};
const Account = require("../../models/account");
const deleteImage = require("../../uploads/deleteImage");

const deletePhoto = (image) => {
  // let img = image.split("/");
  // deleteImage(img[img.length - 1]);
  deleteImage(image);
}

module.exports = async (req, res) => {
  try { 

    console.log("REQUEST BODY PROFILE: ", req.body)
    console.log("REQUEST USER: ", req.user)

    console.log("file: :",req.file)

    deletePhoto(req.body.profile);

    const userAddProfile = await Account.addProfile(req.user._id, req.file.filename );
    if (!userAddProfile) {
      return res.status(404).json({ message: "Failed to delete profile!" });
    }
    res.status(200).json(userAddProfile);
  } catch (error) {
    console.error("error in getting user information: ", error);    
    res.status(400).json(error.message);
  }
};
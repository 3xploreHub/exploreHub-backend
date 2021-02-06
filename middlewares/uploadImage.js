const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log("at saving image: ",req.file);
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    var filetype = "";
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    else if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    } else {
      cb("Invalid file type!", null);
    }
    cb(null, "tourmeimage-" + Date.now() + "." + filetype);
  },
});

module.exports.uploadMulitpleImage = multer({ storage: storage }).array(
  "images",
  10
);
module.exports.uploadSingleImage = multer({ storage: storage }).single("image");

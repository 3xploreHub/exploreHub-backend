const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    var filetype = "";
    if (file.mimetype === "image/gif") {
      filetype = "gif";
    }
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    }
    cb(null, "tourmeimage-" + Date.now() + "." + filetype);
  },
});

module.exports.uploadMulitpleImage = multer({ storage: storage }).array(
  "images",
  10
);
module.exports.uploadSingleImage = multer({ storage: storage }).single("image");

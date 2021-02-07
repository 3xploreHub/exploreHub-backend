var fs = require("fs");

module.exports = (file) => {
  try {
    fs.unlinkSync(__dirname + "\\" + file);
    console.log(file + " is successfully deleted");
  } catch (error) {
    console.error("error in deleting image:  ", error);
  }
};

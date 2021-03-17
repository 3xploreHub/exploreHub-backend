var fs = require("fs");

module.exports = (file) => {
  try {
    fs.unlinkSync(__dirname + "\\" + file);
  } catch (error) {
  }
};
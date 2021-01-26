const touristSpotCategory = require("../../../models/touristSpotCategory");

// {
//   "name": "Mountain adventure",
// }

//{{url}}/touristSpotOperator/addTouristSpotCategory
module.exports.addTouristSpotCategory = async (req, res) => {
  try {
    console.log(req.body);
    req.body["addedBy"] = req.user._id;
    const newCategory = await touristSpotCategory.addTouristSpotCategory(
      req.body
    );
    console.log(newCategory);
    res.status(200).json(newCategory.data);
  } catch (error) {
    console.error("Error in creating new tourist spot: ", error);
    if (error.type == "validation_error") {
      res.status(400).json({
        type: "validation_error",
        message: "Some validations failed",
        error: error.errors,
      });
    } else {
      res.status(400).json({
        type: "internal_error",
        message: "an error occured!",
        error: error,
      });
    }
  }
};

//{{url}}/touristSpotOperator/retrieveAllToristSpotCategories
module.exports.retrieveAllToristSpotCategories = async (req, res) => {
  touristSpotCategory
    .find({}, "name touristSpotTotalCount addedBy")
    .populate("addedBy", "fullName")
    .exec((error, categories) => {
      if (error) {
        res.status(400).json({
          message: "Error in retrieving categories",
          error: error,
        });
      }
      res.status(200).json(categories);
    });
};

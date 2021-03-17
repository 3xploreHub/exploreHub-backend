const touristSpotCategory = require("../../models/touristSpotCategory");

// {
//   "name": "Mountain adventure",
// }

//{{url}}/touristSpotOperator/addTouristSpotCategory
async function addTouristSpotCategory(req, res) {
  try {
    req.body["addedBy"] = req.user._id;
    const newCategory = await touristSpotCategory.addTouristSpotCategory(
      req.body
    );
    if (!req.continue) {
      res.status(200).json(newCategory.data);
    } else {
      return true;
    }
  } catch (error) {
    if (error.type == "validation_error") {
      return res.status(400).json({
        type: "validation_error",
        error: error.errors,
      });

    } else {
      return res.status(400).json({
        type: "internal_error",
        message: "an error occured!",
        error: error,
      });
    }
  }
};

module.exports.addTouristSpotCategory = addTouristSpotCategory;

module.exports.addDefaultCategories = async (req, res) => {
  return touristSpotCategory.find({}).then(async (categories, error) => {
    if (error) {
      res.statu(500).json(error);
    }
    if (categories.length == 0) {
      const defaults = [
        { name: "Island Hopping" },
        { name: "Beach" },
        { name: "Resort" },
        { name: "Mountains and Peaks" }
      ]

      defaults.forEach(async (category) => {
        req['body'] = category;
        req['continue'] = true;
        await addTouristSpotCategory(req, res)
      })

      return defaults;
    }
    return categories;
  })

}

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
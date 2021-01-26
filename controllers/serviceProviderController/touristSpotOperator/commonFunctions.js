module.exports.retrieve = (
  model,
  res,
  condition,
  type,
  fieldsToGet,
  findOne = false
) => {
  model
    .find(condition, fieldsToGet)
    .populate({
      path: "category",
      model: "TouristSpotCategory",
      select: "name",
    })
    .exec((error, touristSpots) => {
      if (error) {
        console.error("Error in retrieving: ", error);
        return res.status(500).json({
          type: "internal_error",
          message: `has error in retrieving ${type}`,
          error: error,
        });
      }

      if (findOne && touristSpots.length == 0) {
        return res.status(404).json({
          type: "not_found",
          message: "The tourist spot does not exist",
        });
      }
      res.status(200).json(findOne ? touristSpots[0] : touristSpots);
    });
};

module.exports.add = (model, touristSpotId, res, data, type) => {
  model.findByIdAndUpdate(
    touristSpotId,
    {
      $addToSet: data,
    },
    { upsert: true },
    function (err, updatedTouristSpot) {
      if (err) {
        return res.status(500).json({
          type: "internal_error",
          message: `has error in adding ${type}`,
          error: err,
        });
      }
      res.status(200).json(updatedTouristSpot);
    }
  );
};

module.exports.handleError = (error, res, errorMessage) => {
  if (error.type == "validation_error") {
    return res.status(400).json(error);
  } else if (error.type == "unauthorized") {
    return res.status(401).json({
      type: "unauthorized",
      message: "You are not allowed to do it",
    });
  } else if (error.type == "not_found") {
    return res.status(404).json({
      type: "not_found",
      message: "Object was not found",
    });
  }
  console.error(errorMessage, error);
  res.status(500).json({
    type: "internal_error",
    message: "unexpected error occured",
    error: error.error,
  });
};

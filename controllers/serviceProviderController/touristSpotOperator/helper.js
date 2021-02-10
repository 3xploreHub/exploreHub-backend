const { ComponentModel } = require("../../../models/commonSchemas/component");
const deleteImage = require("../../../uploads/deleteImage");

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

const addComponent = (model, touristSpotId, res, data, returnData = true) => {
  model.findByIdAndUpdate(
    touristSpotId,
    data,
    { upsert: true },
    function (err, result) {
      if (err) {
        console.log("error= ", err)
        return res.status(500).json({
          type: "internal_error",
          error: err,
        });
      }
      if (returnData) {
        result = Object.values(Object.values(data)[0])[0];
      }
      res.status(200).json(result);
    }
  );
};
module.exports.addComponent = addComponent;

module.exports.addNewComponent = async (model, component, id, res) => {
  try {
    delete component._id;
    const validatedComponent = await ComponentModel.validate(component);
    addComponent(model, id, res, {
      $addToSet: { components: validatedComponent }
    });
  } catch (error) {
    handleError(error, res);
  }
}

module.exports.editComponent = (model, id, _id, data, res, newData, deleteImg = null) => {
  model.updateOne({ "_id": id, "components._id": _id },
    data)
    .then(result => {
      if (deleteImg) deleteImg(newData.imageUrl)
      res.status(200).json(newData);
    }).catch(error => {
      res.status(500).json({ type: 'internal_error!', error: error });
    })
}

module.exports.deleteItem = (model, query, condition, res, images) => {
  model.updateOne(
    query,
    {
      $pull: condition
    }, function (err, numberAffected) {
      if (err) {
        return res.status(500).json({ type: "internal_error", error: err });
      }
      if (images) {
        images.forEach(image => {
          deletePhoto(image);
        });
      }
      res.status(200).json({
        message: "Component successfully deleted",
        result: numberAffected
      })
    });
}

const deletePhoto = (image) => {
  let img = image.split("/");
  deleteImage(img[img.length-1]);
}
module.exports.deletePhoto = deletePhoto;

const handleError = (error, res) => {
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
  console.log(error)
  res.status(500).json({
    type: "internal_error",
    message: "unexpected error occured",
    error: error.error,
  });
};
module.exports.handleError = handleError;
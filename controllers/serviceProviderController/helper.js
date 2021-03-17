const mongoose = require("mongoose");
const { ComponentModel } = require("../../models/commonSchemas/component");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");
const deleteImage = require("../../uploads/deleteImage");

// module.exports.retrieve = (
//   model,
//   res,
//   condition,
//   type,
//   fieldsToGet,
//   findOne = false
// ) => {
//   model
//     .find(condition, fieldsToGet)
//     .populate({
//       path: "category",
//       model: "TouristSpotCategory",
//       select: "name",
//     })
//     .exec((error, touristSpots) => {
//       if (error) {
//         console.error("Error in retrieving: ", error);
//         return res.status(500).json({
//           type: "internal_error",
//           message: `has error in retrieving ${type}`,
//           error: error,
//         });
//       }

//       if (findOne && touristSpots.length == 0) {
//         return res.status(404).json({
//           type: "not_found",
//           message: "The tourist spot does not exist",
//         });
//       }
//       res.status(200).json(findOne ? touristSpots[0] : touristSpots);
//     });
// };

const addComponent = (model, touristSpotId, res, data, returnData = true) => {
  model.findByIdAndUpdate(
    touristSpotId,
    data,
    { upsert: true },
    function (err, result) {
      if (err) {
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

module.exports.addNewComponent = async (model, component, id, res, type = "services") => {
  try {
    delete component._id;
    const data = await ComponentModel.validate(component);
    const newComponent = type == "services" ? { services: data } :
      type == "bookingInfo" ? { bookingInfo: data } : { components: data };
    addComponent(model, id, res, {
      $addToSet: newComponent
    });
  } catch (error) {
    handleError(error, res);
  }
}

module.exports.editComponent = (model, query, data, res, newData, deleteImg = null) => {
  model.updateOne(query,
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
        images.forEach(image => { deletePhoto(image) });
      }
      res.status(200).json({
        message: "Component successfully deleted",
        result: numberAffected
      })
    });
}

const deletePhoto = (image) => {
  let img = image.split("/");
  deleteImage(img[img.length - 1]);
}

module.exports.convertIdToObjectId = (component)=> {
  return component.data.map(data => {
    if (typeof data == 'object') {
      if (data._id) {
        data._id = mongoose.Types.ObjectId(data._id);
      }
    }
    return data;
  })
}
// {
//   "carId": "345677"
//   "car" : {
//       "model" : [
//           {
//               "specs" : [ 
//                   {
//                       "specType": "SEDAN"
//                       "specValue" : "1"
//                   }, 
//                   {
//                       "specType": "BR_INC"
//                       "specValue" : "yes"
//                   }, 
//                   {
//                       "specType": "PLAN"
//                       "specValue" : "gold"
//                   }
//               ]
//           }
//       ]
//   }
// }

// db.collection.aggregate([
//   {
//     "$project": {
//       "car": {
//         "model": {
//           "$filter": {
//             "input": {
//               "$map": {
//                 "input": "$car.model",
//                 "in": {
//                   "specs": {
//                     "$filter": {
//                       "input": "$$this.specs",
//                       "cond": { "$eq": ["$$this.specType", "SEDAN"] }
//                     }
//                   }
//                 }
//               }
//             },
//             "cond": { "$ne": ["$$this.specs", []] }
//           }
//         }
//       }
//     }
//   }
// ])

module.exports.getItem = (pageId, itemId, pageType) => {
  return new Promise((resolve, reject) => {
    const Pages = pageType == "service"? servicePage: touristSpotPage
    Pages.aggregate([
      {
        "$match": { _id: mongoose.Types.ObjectId(pageId) }
      },
      {
        "$project": {
          "services": {
            "$filter": {
              "input": {
                "$map": {
                  "input": "$services",
                  "in": {
                    "data": {
                      "$filter": {
                        "input": "$$this.data",
                        "as": "data",
                        "cond": { "$eq": ["$$data._id", mongoose.Types.ObjectId(itemId)] }
                      }
                    }
                  }
                }
              }, "cond": { "$ne": ["$$this.data", []] }
            }
          }
        }
      }
    ], function (err, data) {
      if (err) {
        reject({ type: "internal_error", error: err })
      } else {
        resolve(data)
      }
    })
  })
}


module.exports.getService = (pageId, serviceId, pageType) => {
  return new Promise((resolve, reject) => {
    const Pages = pageType == "service"? servicePage: touristSpotPage
    Pages.aggregate([
      {
        "$match": { _id: mongoose.Types.ObjectId(pageId) }
      },
      {
        "$project": {
          "services": {
            "$filter": {
              "input": "$services",
              "as": "service",
              "cond": { "$eq": ["$$service._id", mongoose.Types.ObjectId(serviceId)] }
            }
          }
        }
      }
    ], function (err, data) {
      if (err) {
        reject({ type: "internal_error", error: err })
      } else {
        resolve(data)
      }
    })
  })
}

module.exports.getImages = (data) => {
  let images = []
  data.data.forEach(data => {
    if (data.type == "item") {
      data.data.forEach(comp => {
        if (comp.type == "photo") {
          comp.data.forEach(img => {
            images.push(img.url);
          })
        }
      })
    }
  })
  return images;
}

module.exports.deletePhoto = deletePhoto;

const handleError = (error, res) => {
  switch (error.type) {
    case "validation_error":
      return res.status(400).json(error);
    case "unauthorized":
      return res.status(401).json({
        type: "unauthorized",
        message: "You are not allowed to do it",
      });
    case "not_found":
      return res.status(404).json({
        type: "not_found",
        message: "Object was not found",
      });
    default:
      console.log(error)
      res.status(500).json({
        type: "internal_error",
        message: "unexpected error occured",
        error: error.error,
      });
      break;
  }
};
module.exports.handleError = handleError;
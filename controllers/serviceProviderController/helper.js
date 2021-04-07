const mongoose = require("mongoose");
const { ComponentModel } = require("../../models/commonSchemas/component");
const { Item } = require("../../models/item");
const notification = require("../../models/notification");
const Page = require("../../models/page");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");
const deleteImage = require("../../uploads/deleteImage");

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

module.exports.convertIdToObjectId = (component) => {
  return component.data.map(data => {
    if (typeof data == 'object') {
      if (data._id) {
        data._id = mongoose.Types.ObjectId(data._id);
      }
    }
    return data;
  })
}

module.exports.getItem = (pageId, itemId, pageType) => {
  return new Promise((resolve, reject) => {
    // const Pages = pageType == "service" ? servicePage : touristSpotPage
    Page.aggregate([
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
    // const Pages = pageType == "service" ? servicePage : touristSpotPage
    Page.aggregate([
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
      const img = getItemImages(data);
      if (img.length > 0) {
        images = [...images, ...img];
      }
      // data.data.forEach(comp => {
      //   if (comp.type == "photo") {
      //     comp.data.forEach(img => {
      //       images.push(img.url);
      //     })
      //   }
      // })
    }
  })
  return images;
}

function getItemImages(data) {
  let images = []
  data.data.forEach(comp => {
    if (comp.type == "photo") {
      comp.data.forEach(img => {
        images.push(img.url);
      })
    }
  })
  return images;
}

module.exports.updateItemBookingCount = (service, res, booked = true) => {
  const data = booked? {booked : service.booked} : {manuallyBooked: service.manuallyBooked}
  Item.updateOne({
    _id: mongoose.Types.ObjectId(service._id)
  }, {
    $set: data
  }).then(result => {
    console.log("updated item ", service)
  }).catch(error => {
    return res.status(500).json(error)
  })
}


function createNotification(data) {
  return new Promise(async (resolve, reject) => {
    try {
      let { receiver, initiator, page, booking, type, message } = data;

      let notif = new notification({
        receiver: receiver,
        initiator: initiator,
        page: page,
        booking: booking,
        type: type,
        message: message,
        opened: false
      })

      await notif.save();
      resolve(notif)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.createNotification = createNotification;

module.exports.getItemImages = getItemImages

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
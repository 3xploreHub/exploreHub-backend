// error response format
// {
//   type:String  ---> underscore_separated_name
//   error: error, ---> here we pass the error from the catch block,, we also pass here the validation errors for forms
//   message: ---> description //optional
// }

const { json } = require("body-parser");
const mongoose = require("mongoose");
const { restart } = require("nodemon");
const { ComponentModel } = require("../../../models/commonSchemas/component");
const {
  extraServiceModel,
} = require("../../../models/commonSchemas/extraService");
const { FeatureModel } = require("../../../models/commonSchemas/feature");
const { ImageModel } = require("../../../models/commonSchemas/image");
const {
  otherFacilityModel,
} = require("../../../models/commonSchemas/otherFacility");
const { regulationModel } = require("../../../models/commonSchemas/regulation");
const { roomModel } = require("../../../models/commonSchemas/room");
const TouristSpot = require("../../../models/touristSpot");
const touristSpotCategory = require("../../../models/touristSpotCategory");
const TouristSpotPage = require("../../../models/touristSpotPage");
const deleteImage = require("../../../uploads/deleteImage");
const helper = require("./helper");

//formdata
//
//   image --mapto--> coverPhoto
//
//
//
//  body
// category:5fe98279fbcb1610ac3ad1ba
// zipcode:121212
// latitude: 122
// longitude: 321
// municipality:dalaguete
// name:    rivas touristspot 123
// barangay:barangay
// description:some description
// city:city23

//http://localhost:3000/api/touristSpotOperator/createTouristSpotPost
// module.exports.createTouristSpot = async (req, res) => {
//   if (req.file) {
//     req.body["coverPhoto"] = req.file.filename;
//   }
//   req.body["creator"] = req.user._id;
//   const newTouristSpot = new TouristSpot(req.body);

//   newTouristSpot.address = {
//     barangay: req.body.barangay,
//     municipality: req.body.municipality,
//     city: req.body.city,
//   };
//   newTouristSpot.completeAddress = `${req.body.barangay}, ${req.body.municipality}, ${req.body.city}`;

//   let validationResult = validateTouristSpot(newTouristSpot);

//   if (!newTouristSpot.coverPhoto) {
//     const errorMessage = "Cover photo is required";
//     if (validationResult) {
//       validationResult.push(errorMessage);
//     } else {
//       validationResult = [errorMessage];
//     }
//   }

//   try {
//     const result = await saveTouristSpot(validationResult, newTouristSpot);
//     res.status(200).json(result.data);
//   } catch (error) {
//     helper.handleError(
//       error,
//       res,
//     );
//   }
// };

// const saveTouristSpot = (validationResult, newTouristSpot) => {
//   return new Promise(async (resolve, reject) => {
//     if (!validationResult) {
//       try {
//         const updateResult = await updateCategoryTouristSpotCount(
//           newTouristSpot,
//           1
//         );
//         console.log(updateResult);
//         if (updateResult.type == "successful") {
//           return newTouristSpot.save().then((createdTouristSpot, error) => {
//             if (error) {
//               reject({ type: "internal_error" });
//             } else {
//               resolve({
//                 type: "successful",
//                 data: createdTouristSpot,
//               });
//             }
//           });
//         } else {
//           deleteCoverPhoto(newTouristSpot);
//           reject({
//             type: updateResult.type,
//             error: updateResult.error,
//           });
//         }
//       } catch (error) {
//         reject({
//           type: "internal_error",
//           error: "" + error,
//         });
//       }
//     } else {
//       deleteCoverPhoto(newTouristSpot);
//       reject({ type: "validation_error", error: validationResult });
//     }
//   });
// };

// function validateTouristSpot(newObject) {
//   let result;
//   let validatonError = newObject.validateSync();

//   if (validatonError) {
//     result = Object.values(validatonError.errors).map((err) => err.message);
//   }

//   return result;
// }

// const updateCategoryTouristSpotCount = (newObject, value) => {
//   return touristSpotCategory
//     .findOne({ _id: newObject.category })
//     .then(async (category, err) => {
//       if (err) {
//         deleteCoverPhoto(newObject);
//         return {
//           type: "validation_error",
//           error: ["Error in retrieving the category"],
//         };
//       }
//       if (category) {
//         try {
//           const updated = await touristSpotCategory.findByIdAndUpdate(
//             category._id,
//             {
//               $set: {
//                 touristSpotTotalCount: category.touristSpotTotalCount + value,
//               },
//             },
//             { upsert: true },
//             function (err, updatedCategory) {
//               if (err) return err;
//               return updatedCategory;
//             }
//           );
//           console.log(updated);
//           if (updated) {
//             return { type: "successful", data: updated };
//           }
//         } catch (error) {
//           return {
//             type: "internal_error",
//             error: "" + error,
//           };
//         }
//       } else {
//         deleteCoverPhoto(newObject);
//         return {
//           type: "validation_error",
//           error: ["Can't find tourist spot's category"],
//         };
//       }
//     });
// };

// function deleteCoverPhoto(object) {
//   if (object.coverPhoto) {
//     deleteImage(object.coverPhoto);
//   }
// }

// //{{url}}/touristSpotOperator/retrieveAllToristSpotCategories
// module.exports.retrieveAllToristSpot = (req, res) => {
//   helper.retrieve(
//     TouristSpot,
//     res,
//     {},
//     "all tourist spots",
//     "name category location entracePay operationType"
//   );
// };

// //{{url}}/touristSpotOperator/retrieveTouristSpotByCategory/5fe5a947bc241532f03a055c
// module.exports.retrieveTouristSpotByCategory = (req, res) => {
//   helper.retrieve(
//     TouristSpot,
//     res,
//     { category: req.params.id },
//     "the tourist spots categor",
//     "name category location entracePay operationType"
//   );
// };

// //{{url}}/touristSpotOperator/retrieveTouristSpot/5fe5b1ecfbdb14361cddb356
// module.exports.retrieveTouristSpot = (req, res) => {
//   helper.retrieve(
//     TouristSpot,
//     res,
//     { _id: req.params.id },
//     "tourist spot",
//     "",
//     true
//   );
// };

// // {
// //   "title":"Proper disposal of garbage",
// //   "description":"this is some description",
// //   "consequence":"some consequences"
// // }

// //{{url}}/touristSpotOperator/addRegulation/5fe5b1ecfbdb14361cddb358
// module.exports.addRegulation = async (req, res) => {
//   try {
//     const validatedRegulation = await regulationModel.validate(req.body);
//     helper.addComponent(
//       TouristSpot,
//       req.params.id,
//       res,
//       { regulations: validatedRegulation },
//     );
//   } catch (error) {
//     helper.handleError(error, res);
//   }
// };

// // roomCategory:Family bedroom
// // bedCapacity:6
// // quantity: 15
// // price:2000
// // billingMethod:per-head per night
// // description:some description

// //{{url}}/touristSpotOperator/addRoom/5fe5d504c6dbad3c181b157e
// module.exports.addRoom = async (req, res) => {
//   try {
//     const images = req.files.map((file) => file.filename);
//     req.body["images"] = images;
//     const validatedRoom = await roomModel.validate(req.body);
//     helper.addComponent(
//       TouristSpot,
//       req.params.id,
//       res,
//       { rooms: validatedRoom },
//     );
//   } catch (error) {
//     helper.handleError(error, res);
//   }
// };

// // photo:
// // caption: Some caption

// //{{url}}/touristSpotOperator/addFeature/5fe5d504c6dbad3c181b157e
// module.exports.addFeature = async (req, res) => {
//   try {
//     if (req.file) {
//       req.body["photo"] = req.file.filename;
//     }
//     const validatedFeature = await FeatureModel.validate(req.body);
//     helper.addComponent(
//       TouristSpot,
//       req.params.id,
//       res,
//       { features: validatedFeature },
//     );
//   } catch (error) {
//     helper.handleError(error, res);
//   }
// };

// // {
// //   "name":"all-day breakfast",
// //   "price":1200,
// //   "description":"some descriptioin",
// //   "quantity":7
// // }

// // {{url}}/touristSpotOperator/addExtraService/5fe5d504c6dbad3c181b157e
// module.exports.addExtraService = async (req, res) => {
//   try {
//     const validatedExtraService = await extraServiceModel.validate(req.body);
//     helper.addComponent(
//       TouristSpot,
//       req.params.id,
//       res,
//       { extraServices: validatedExtraService },
//     );
//   } catch (error) {
//     helper.handleError(error, res);
//   }
// };

// // {
// //   "name":"Karaoke room",
// //   "description":"this is some description" ,
// //   "price":1150,
// //   "quantity":5
// // }

// // {{url}}/touristSpotOperator/addOtherFacility/5fe5d504c6dbad3c181b157e
// //still deciding whether to add it or not
// module.exports.addOtherFacility = async (req, res) => {
//   try {
//     const images = req.files.map((file) => file.filename);
//     req.body["images"] = images;
//     const validatedFacility = await otherFacilityModel.validate(req.body);
//     helper.addComponent(
//       TouristSpot,
//       req.params.id,
//       res,
//       { otherFacilities: validatedFacility },
//     );
//   } catch (error) {
//     helper.handleError(error, res);
//   }
// };

// //formdata
// //
// //  image --mapto--> coverPhoto
// //
// // [ multiple files ]
// //
// //  body
// // category:5fe98279fbcb1610ac3ad1ba
// // zipcode:121212
// // latitude: 122
// // longitude: 321
// // municipality:dalaguete
// // name:    rivas touristspot 123
// // barangay:barangay
// // description:some description
// // city:city23

// module.exports.updateTouristSpot = async (req, res) => {
//   try {
//     if (req.file) {
//       req.body["coverPhoto"] = req.file.filename;
//     }
//     const updateResult = await updateTouristSpot(req);
//     res.status(200).json(updateResult);
//   } catch (error) {
//     helper.handleError(error, res);
//   }
// };

// const updateTouristSpot = async (req) => {
//   try {
//     const touristSpotToEdit = await TouristSpot.findOne({
//       _id: req.params.id,
//       creator: req.user._id,
//     });

//     return new Promise(function (resolve, reject) {
//       if (!touristSpotToEdit) {
//         reject({
//           type: "not_found",
//         });
//       } else {
//         let oldCoverPhoto = { coverPhoto: null };
//         if (req.body.coverPhoto) {
//           oldCoverPhoto = { coverPhoto: touristSpotToEdit.coverPhoto };
//           touristSpotToEdit.coverPhoto = req.body.coverPhoto;
//         }
//         touristSpotToEdit.name = req.body.name;
//         touristSpotToEdit.completeAddress = `${req.body.barangay}, ${req.body.municipality}, ${req.body.city}`;
//         touristSpotToEdit.address = {
//           barangay: req.body.barangay,
//           municipality: req.body.municipality,
//           city: req.body.city,
//         };
//         touristSpotToEdit.description = req.body.description;
//         touristSpotToEdit.zipcode = req.body.zipcode;
//         touristSpotToEdit.latitude = req.body.latitude;
//         touristSpotToEdit.longitude = req.body.longitude;

//         const validationResult = validateTouristSpot(touristSpotToEdit);

//         if (!validationResult) {
//           touristSpotToEdit.save().then((updatedTouristSpot, error) => {
//             if (error) {
//               reject({
//                 type: "internal_error",
//                 error: "" + error,
//               });
//             } else {
//               deleteCoverPhoto(oldCoverPhoto);
//               resolve(updatedTouristSpot);
//             }
//           });
//         } else {
//           deleteCoverPhoto(touristSpotToEdit);
//           reject({ type: "validation_error", error: validationResult });
//         }
//       }
//     });
//   } catch (error) {
//     reject({
//       type: "internal_error",
//       error: "" + error,
//     });
//   }
// };



//NEW CHANGES.....====================================================

module.exports.addComponent = (req, res) => {
  helper.addNewComponent(TouristSpotPage, req.body, req.params.id, res, 'components');
}

module.exports.addServiceComponent = (req, res) => {
  helper.addNewComponent(TouristSpotPage, req.body, req.params.id, res);
}

module.exports.addChildComponent = async (req, res) => {
  try {
    delete req.body._id;
    const validComponent = await ComponentModel.validate(req.body);
    helper.editComponent(TouristSpotPage, { "_id": req.params.parentId, "services._id":  req.params.serviceId },
      { $push: { "services.$.data": validComponent } }, res, validComponent);
  } catch (error) {
    console.log(error);
    helper.handleError(error, res);
  }
}

module.exports.addComponenWithMedia = (req, res) => {
  const newImage = new ImageModel({ url: process.env.HOST + req.file.filename });
  let component = JSON.parse(req.body.values)
  component.data = [newImage];
  if (component._id) {
    helper.editComponent(TouristSpotPage,{ "_id":  req.params.id, "components._id": component._id },
      { $push: { "components.$.data": newImage } }, res, component);
  } else {
    helper.addNewComponent(TouristSpotPage, component, req.params.id, res);
  }
}

module.exports.editComponent = async (req, res) => {
  try {
    const validComponent = await ComponentModel.validate(req.body);
    helper.editComponent(TouristSpotPage, { "_id":  req.params.id, "components._id":req.body._id },
      {
        $set: {
          "components.$.data": validComponent.data,
          "components.$.styles": validComponent.styles
        }
      }, res, validComponent);
  } catch (error) {
    helper.handleError(error, res)
  }
}

module.exports.deleteComponent = async (req, res) => {
  helper.deleteItem(TouristSpotPage,
    { _id: req.params.id },
    { 'components': { '_id': req.params.componentId } }, res, req.body.images)
}

module.exports.deleteImage = (req, res) => {
  helper.editComponent(TouristSpotPage, { "_id":  req.params.id, "components._id": req.body.componentId },
    {
      $pull: {
        "components.$.data": { "_id": mongoose.Types.ObjectId(req.body.imageId) },
      }
    }, res, { imageUrl: req.body.imageUrl, message: "Successfull deleted" }, helper.deletePhoto);
}

module.exports.createTouristSpotPage = (req, res) => {
  let defaultPhoto = { type: "photo", data: [], styles: [], default: true }
  let labelledText1 = { type: "text", data: { placeholder: "Enter tourist spot name here", text: null }, styles: ["bg-light", "text-left", "font-large", "fontStyle-normal", "color-dark"], default: true }
  let labelledText2 = { type: "labelled-text", data: { label: "Location", text: null }, styles: [], default: true }
  let labelledText3 = { type: "labelled-text", data: { label: "Description", text: null }, styles: [], default: true }
  let photo = new ComponentModel(defaultPhoto)
  let name = new ComponentModel(labelledText1)
  let location = new ComponentModel(labelledText2)
  let description = new ComponentModel(labelledText3)

  let defaultComponents = [photo, name, location, description];
  const page = new TouristSpotPage();
  page.creator = req.user._id;
  page.components = defaultComponents;

  page.save().then((createPage, error) => {
    if (error) {
      return res.status(500).json({
        type: "internal_error",
        message: "Unexpected error occured!",
        error: error
      })
    }
    res.status(200).json(createPage)
  })
}

module.exports.retrieveToristSpotPage = (req, res) => {
  TouristSpotPage.findById(req.params.id).then((page, error) => {
    if (error) {
      return res.status(500).json({
        type: "internal_error",
        message: "unexpected error occured!",
        error: error
      });
    }
    if (!page) {
      return res.status(404).json({ type: "not_found" })
    }
    res.status(200).json(page);
  })
}


const express = require("express");
const router = express();

const touristSpotCrud = require("../../controllers/serviceProviderController/touristSpotOperator/touristSpotCrud");
const touristSpotCategoriesCrud = require("../../controllers/serviceProviderController/touristSpotOperator/touristSpotCategoriesCrud");
const uploadImage = require("../../middlewares/uploadImage");

// router.post(
//   "/createTouristSpot",
//   uploadImage.uploadSingleImage,
//   touristSpotCrud.createTouristSpot
// );
// router.post(
//   "/addTouristSpotCategory",
//   touristSpotCategoriesCrud.addTouristSpotCategory
// );
// router.get( 
//   "/retrieveAllToristSpotCategories",
//   touristSpotCategoriesCrud.retrieveAllToristSpotCategories
// );

// router.get("/retrieveAllToristSpot", touristSpotCrud.retrieveAllToristSpot);
// router.get(
//   "/retrieveTouristSpotByCategory/:id",
//   touristSpotCrud.retrieveTouristSpotByCategory
// );

// router.get("/retrieveTouristSpot/:id", touristSpotCrud.retrieveTouristSpot);

// router.put("/addRegulation/:id", touristSpotCrud.addRegulation);
// router.put(
//   "/addRoom/:id",
//   uploadImage.uploadMulitpleImage,
//   touristSpotCrud.addRoom
// );

// router.put(
//   "/addFeature/:id", 
//   uploadImage.uploadSingleImage,
//   touristSpotCrud.addFeature
// );

// router.put("/addExtraService/:id", touristSpotCrud.addExtraService);
// router.put(
//   "/addOtherFacility/:id",
//   uploadImage.uploadMulitpleImage,
//   touristSpotCrud.addOtherFacility
// );
  
// router.put(
//   "/updateTouristSpot/:id",
//   uploadImage.uploadSingleImage,
//   touristSpotCrud.updateTouristSpot
// );

router.post("/createTouristSpotPage", touristSpotCrud.createTouristSpotPage)
router.post("/addComponent/:id", touristSpotCrud.addComponent)
router.get("/retrieveToristSpotPage/:id", touristSpotCrud.retrieveToristSpotPage)
router.put("/editComponent/:id", touristSpotCrud.editComponent)
router.post("/addComponentWithMedia/:id", uploadImage.uploadSingleImage, touristSpotCrud.addComponenWithMedia)
router.post("/deleteImage/:id", touristSpotCrud.deleteImage)
router.post("/deleteComponent/:id/:componentId", touristSpotCrud.deleteComponent)


// router.delete("/deleteTouristSpot/:id", touristSpotCrud.deleteTouristSpot);
module.exports = router;

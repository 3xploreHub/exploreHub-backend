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

router.post("/addDefaultCategories", touristSpotCategoriesCrud.addDefaultCategories);

router.post("/createTouristSpotPage", touristSpotCrud.createTouristSpotPage)
router.post("/addComponent/:id", touristSpotCrud.addComponent)
router.post("/saveItem/:parentId/:serviceId", touristSpotCrud.saveItem)
router.post("/addServiceChildComponent/:pageId/:grandParentId/:parentId", touristSpotCrud.addServiceChildComponent)
router.post("/addServiceComponent/:id", touristSpotCrud.addServiceComponent)
router.get("/retrieveToristSpotPage/:id", touristSpotCrud.retrieveToristSpotPage)
router.put("/editComponent/:id", touristSpotCrud.editComponent)
router.put("/editChildComponent/:pageId/:grandParentId/:parentId", touristSpotCrud.editChildComponent)
router.post("/deleteChildComponent/:pageId/:grandParentId/:childId", touristSpotCrud.deleteChildComponent)
router.post("/deleteItemChild/:pageId/:grandParentId/:parentId/:childId", touristSpotCrud.deleteItemChild)
router.post("/addComponentImage/:parentId/:childId", uploadImage.uploadSingleImage, touristSpotCrud.addComponentImage)
router.post("/addItemChildComponentImage/:pageId/:grandParentId/:parentId/:childId", uploadImage.uploadSingleImage, touristSpotCrud.addItemChildComponentImage)
router.post("/deleteImage/:id", touristSpotCrud.deleteImage)
router.post("/deleteItemImage/:pageId/:grandParentId/:parentId", touristSpotCrud.deleteItemImage)
router.post("/deleteComponent/:id/:componentId", touristSpotCrud.deleteComponent)
router.post("/deleteInputField/:pageId/:grandParentId/:parentId/:childId", touristSpotCrud.deleteInputField)
router.delete("/deleteItem/:pageId/:itemListId/:itemId", touristSpotCrud.deleteItem)
router.delete("/deleteServiceComponent/:pageId/:serviceId", touristSpotCrud.deleteServiceComponent)
router.get("/getItemUpdatedData/:pageId/:serviceId/:itemId", touristSpotCrud.getItemUpdatedData)
router.get("/getUpdatedItemListData/:pageId/:serviceId", touristSpotCrud.getUpdatedItemListData)
router.put("/editServiceInfo/:pageId/:serviceId/:infoId", touristSpotCrud.editServiceInfo)
router.post("/saveInputField/:pageId/:grandParentId/:parentId", touristSpotCrud.saveInputField)
router.put("/editInputField/:pageId/:grandParentId/:parentId", touristSpotCrud.editInputField)

// router.delete("/deleteTouristSpot/:id", touristSpotCrud.deleteTouristSpot);
module.exports = router;

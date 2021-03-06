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

router.post("/addComponent/:id/:pageType", touristSpotCrud.addComponent)
router.post("/saveItem/:parentId/:serviceId/:pageType", touristSpotCrud.saveItem)
router.post("/addServiceChildComponent/:pageId/:grandParentId/:parentId/:pageType", touristSpotCrud.addServiceChildComponent)
router.post("/addServiceComponent/:id/:pageType", touristSpotCrud.addServiceComponent)
router.put("/editComponent/:id/:pageType", touristSpotCrud.editComponent)
router.put("/editChildComponent/:pageId/:grandParentId/:parentId/:pageType", touristSpotCrud.editChildComponent)
router.post("/deleteChildComponent/:pageId/:grandParentId/:childId/:pageType", touristSpotCrud.deleteChildComponent)
router.post("/deleteItemChild/:pageId/:grandParentId/:parentId/:childId/:pageType", touristSpotCrud.deleteItemChild)
router.post("/addComponentImage/:parentId/:childId/:pageType", uploadImage.uploadSingleImage, touristSpotCrud.addComponentImage)
router.post("/addItemChildComponentImage/:pageId/:grandParentId/:parentId/:childId/:pageType", uploadImage.uploadSingleImage, touristSpotCrud.addItemChildComponentImage)
router.post("/deleteImage/:id/:pageType", touristSpotCrud.deleteImage)
router.post("/deleteItemImage/:pageId/:grandParentId/:parentId/:pageType", touristSpotCrud.deleteItemImage)
router.post("/deleteComponent/:id/:componentId/:pageType", touristSpotCrud.deleteComponent)
router.post("/deleteInputField/:pageId/:grandParentId/:parentId/:childId/:pageType", touristSpotCrud.deleteInputField)
router.delete("/deleteItem/:pageId/:itemListId/:itemId/:pageType", touristSpotCrud.deleteItem)
router.delete("/deleteServiceComponent/:pageId/:serviceId/:pageType", touristSpotCrud.deleteServiceComponent)
router.get("/getItemUpdatedData/:pageId/:serviceId/:itemId/:pageType", touristSpotCrud.getItemUpdatedData)
router.get("/getUpdatedItemListData/:pageId/:serviceId/:pageType", touristSpotCrud.getUpdatedItemListData)
router.put("/editServiceInfo/:pageId/:serviceId/:infoId/:pageType", touristSpotCrud.editServiceInfo)
router.post("/saveInputField/:pageId/:grandParentId/:parentId/:pageType", touristSpotCrud.saveInputField)
router.put("/editInputField/:pageId/:grandParentId/:parentId/:pageType", touristSpotCrud.editInputField)
router.delete("/deletePage/:id/:pageType", touristSpotCrud.deletePage)
router.get("/retrieveAllTouristSpotsPage", touristSpotCrud.retrieveAllTouristSpotsPage)

router.post("/createTouristSpotPage", touristSpotCrud.createTouristSpotPage)
router.post("/createServicePage", touristSpotCrud.createServicePage)
router.get("/retrievePage/:id/:pageType", touristSpotCrud.retrievePage)


// router.delete("/deleteTouristSpot/:id", touristSpotCrud.deleteTouristSpot);
module.exports = router;

const express = require("express");
const router = express();

const pageCreationCrud = require("../../controllers/serviceProviderController/pageCreationCrud");
const touristSpotCategoriesCrud = require("../../controllers/serviceProviderController/touristSpotCategoriesCrud");
const uploadImage = require("../../middlewares/uploadImage");
const serviceProviderCrud = require("../../controllers/serviceProviderController/serviceProviderCrud");

router.post("/addDefaultCategories", touristSpotCategoriesCrud.addDefaultCategories);

router.post("/addComponent/:id/:pageType", pageCreationCrud.addComponent)
router.post("/saveItem/:parentId/:serviceId/:pageType", pageCreationCrud.saveItem)
router.post("/addServiceChildComponent/:pageId/:grandParentId/:parentId/:pageType", pageCreationCrud.addServiceChildComponent)
router.post("/addServiceComponent/:id/:pageType", pageCreationCrud.addServiceComponent)
router.put("/editComponent/:id/:pageType", pageCreationCrud.editComponent)
router.put("/editChildComponent/:pageId/:grandParentId/:parentId/:pageType", pageCreationCrud.editChildComponent)
router.post("/deleteChildComponent/:pageId/:grandParentId/:childId/:pageType", pageCreationCrud.deleteChildComponent)
router.post("/deleteItemChild/:pageId/:grandParentId/:parentId/:childId/:pageType", pageCreationCrud.deleteItemChild)
router.post("/addComponentImage/:parentId/:childId/:pageType", uploadImage.uploadSingleImage, pageCreationCrud.addComponentImage)
router.post("/addItemChildComponentImage/:pageId/:grandParentId/:parentId/:childId/:pageType", uploadImage.uploadSingleImage, pageCreationCrud.addItemChildComponentImage)
router.post("/deleteImage/:id/:pageType", pageCreationCrud.deleteImage)
router.post("/deleteItemImage/:pageId/:grandParentId/:parentId/:pageType", pageCreationCrud.deleteItemImage)
router.post("/deleteComponent/:id/:componentId/:pageType", pageCreationCrud.deleteComponent)
router.post("/deleteInputField/:pageId/:grandParentId/:parentId/:childId/:pageType", pageCreationCrud.deleteInputField)
router.delete("/deleteItem/:pageId/:itemListId/:itemId/:pageType", pageCreationCrud.deleteItem)
router.delete("/deleteServiceComponent/:pageId/:serviceId/:pageType", pageCreationCrud.deleteServiceComponent)
router.get("/getItemUpdatedData/:pageId/:serviceId/:itemId/:pageType", pageCreationCrud.getItemUpdatedData)
router.get("/getUpdatedItemListData/:pageId/:serviceId/:pageType", pageCreationCrud.getUpdatedItemListData)
router.put("/editServiceInfo/:pageId/:serviceId/:infoId/:pageType", pageCreationCrud.editServiceInfo)
router.post("/saveInputField/:pageId/:grandParentId/:parentId/:pageType", pageCreationCrud.saveInputField)
router.put("/editInputField/:pageId/:grandParentId/:parentId/:pageType", pageCreationCrud.editInputField)
router.delete("/deletePage/:pageId/:pageType", pageCreationCrud.deletePage)
router.get("/retrieveAllTouristSpotsPage", pageCreationCrud.retrieveAllTouristSpotsPage)

router.post("/createPage/:pageType", pageCreationCrud.createPage)
router.get("/retrievePage/:pageId/:pageType", pageCreationCrud.retrievePage)
router.post("/submitPage/:pageId/:pageType", pageCreationCrud.submitPage)


router.get("/getPages/:status", serviceProviderCrud.getPages);
router.get("/getPage/:pageId/:pageType", serviceProviderCrud.getPage)
// router.delete("/deleteTouristSpot/:id", touristSpotCrud.deleteTouristSpot);
module.exports = router;

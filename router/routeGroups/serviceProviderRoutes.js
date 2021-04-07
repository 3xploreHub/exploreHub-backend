const express = require("express");
const router = express();

const pageCreation = require("../../controllers/serviceProviderController/pageCreation");
const touristSpotCategories = require("../../controllers/serviceProviderController/touristSpotCategories");
const uploadImage = require("../../middlewares/uploadImage");
const serviceProvider = require("../../controllers/serviceProviderController/serviceProvider");
const tourist = require("../../controllers/serviceProviderController/tourist");

router.post("/addDefaultCategories", touristSpotCategories.addDefaultCategories);

router.post("/addComponent/:id/:pageType", pageCreation.addComponent)
router.post("/saveItem/:parentId/:serviceId/:pageType", pageCreation.saveItem)
router.post("/addServiceChildComponent/:pageId/:grandParentId/:parentId/:pageType", pageCreation.addServiceChildComponent)
router.post("/addServiceComponent/:id/:pageType", pageCreation.addServiceComponent)
router.put("/editComponent/:id/:pageType", pageCreation.editComponent)
router.put("/editChildComponent/:pageId/:grandParentId/:parentId/:pageType", pageCreation.editChildComponent)
router.post("/deleteChildComponent/:pageId/:grandParentId/:childId/:pageType", pageCreation.deleteChildComponent)
router.post("/deleteItemChild/:pageId/:grandParentId/:parentId/:childId/:pageType", pageCreation.deleteItemChild)
router.post("/addComponentImage/:parentId/:childId/:pageType", uploadImage.uploadSingleImage, pageCreation.addComponentImage)
router.post("/addItemChildComponentImage/:pageId/:grandParentId/:parentId/:childId/:pageType", uploadImage.uploadSingleImage, pageCreation.addItemChildComponentImage)
router.post("/deleteImage/:id/:pageType", pageCreation.deleteImage)
router.post("/deleteItemImage/:pageId/:grandParentId/:parentId/:pageType", pageCreation.deleteItemImage)
router.post("/deleteComponent/:id/:componentId/:pageType", pageCreation.deleteComponent)
router.post("/deleteInputField/:pageId/:grandParentId/:parentId/:childId/:pageType", pageCreation.deleteInputField)
router.delete("/deleteItem/:pageId/:itemListId/:itemId/:pageType", pageCreation.deleteItem)
router.delete("/deleteServiceComponent/:pageId/:serviceId/:pageType", pageCreation.deleteServiceComponent)
router.get("/getItemUpdatedData/:pageId/:serviceId/:itemId/:pageType", pageCreation.getItemUpdatedData)
router.get("/getUpdatedItemListData/:pageId/:serviceId/:pageType", pageCreation.getUpdatedItemListData)
router.put("/editServiceInfo/:pageId/:serviceId/:infoId/:pageType", pageCreation.editServiceInfo)
router.post("/saveInputField/:pageId/:grandParentId/:parentId/:pageType", pageCreation.saveInputField)
router.put("/editInputField/:pageId/:grandParentId/:parentId/:pageType", pageCreation.editInputField)
router.delete("/deletePage/:pageId/:pageType", pageCreation.deletePage)

router.get("/retrieveAllTouristSpotsPage", pageCreation.retrieveAllTouristSpotsPage)
router.post("/createPage/:pageType", pageCreation.createPage)
router.get("/retrievePage/:pageId/:pageType", pageCreation.retrievePage)
router.post("/submitPage/:pageId/:pageType", pageCreation.submitPage)
router.get("/getPages/:status", serviceProvider.getPages);
router.get("/getPage/:pageId/:pageType", serviceProvider.getPage)
router.get("/getServices/:pageId/:pageType", serviceProvider.getServices)
router.get("/getPageBooking/:bookingStatus/:pageId", serviceProvider.getPageBooking)

router.get("/getOnlinePages/", tourist.getOnlinePages)
router.get("/viewPage/:pageId/:pageType", tourist.viewPage)
router.get("/viewItems/:pageId/:serviceId/:pageType", tourist.viewItems)
router.get("/viewAllServices/:pageId", tourist.viewAllServices)
router.get("/getDefaultCategories/:pageType", pageCreation.getDefaultCategories)
router.post("/createBooking/:pageId/:pageType/:bookingId", tourist.createBooking)
router.get("/getBooking/:bookingId/:purpose", tourist.getBooking)
router.post("/addBookingInfo/:bookingId", tourist.addBookingInfo)
router.get("/getPageBookingInfo/:pageId/:pageType/:bookingId", tourist.getPageBookingInfo)
router.post("/submitBooking/:bookingId", tourist.submitBooking)
router.get("/getBookings/:bookingStatus", tourist.getBookings)
router.get("/viewBooking/:bookingId", tourist.viewBooking)
router.delete("/deleteBooking/:bookingId", tourist.deleteBooking)
router.get("/getNotifications", tourist.getNotifications)
router.put("/viewNotification/:notificationId", tourist.viewNotification)
router.put("/removeSelectedItem/:bookingId/:selectedId", tourist.removeSelectedItem)
router.post("/changeBookingStatus/:status", tourist.changeBookingStatus)
// router.delete("/deleteTouristSpot/:id", touristSpotCrud.deleteTouristSpot);
module.exports = router;

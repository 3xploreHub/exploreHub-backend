const mongoose = require("mongoose");
const { ComponentModel } = require("../../models/commonSchemas/component");
const { ImageModel } = require("../../models/commonSchemas/image");
const deleteImage = require("../../uploads/deleteImage");
const helper = require("./helper");
const touristSpotCategoriesCrud = require("./touristSpotCategories");
const serviceCategoriesCrud = require("./serviceCategories");
const { serviceModel } = require("../../models/service");
const { Item } = require("../../models/item");
const Page = require("../../models/page");

module.exports.addComponent = (req, res) => {
  // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
  helper.addNewComponent(Page, req.body, req.params.id, res, 'components');
}

function makeDefaultItem(serviceId="", pageId="") {
  const servicePhoto = new ComponentModel({ type: "photo", data: [], styles: [], default: false })
  const name = new ComponentModel({ type: "text", data: { placeholder: "Enter item's name", text: null, defaultName: "name" }, styles: ["bg-light", "text-left", "font-small", "fontStyle-bold", "color-dark"], default: true })
  const quantity = new ComponentModel({ type: "labelled-text", data: { label: "Quantity", text: "1", defaultName: 'quantity' }, styles: [], default: true })
  return new Item({ type: "item", serviceId: serviceId, pageId: pageId, styles: [], booked: 0, data: [servicePhoto, name, quantity], default: false })
}

module.exports.addServiceComponent = async (req, res) => {
  try {
    // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
    delete req.body._id;
    let data = new serviceModel(req.body);

    const serviceInfoDefault = new Item({ type: "text", serviceId: data._id, pageId: req.params.id, data: { placeholder: "Enter service name or other info here", text: null, defaultName: "name" }, styles: ["bg-light", "text-center", "font-medium", "fontStyle-bold", "color-dark"], default: true })
    const defaultComponent = makeDefaultItem(data._id, req.params.id);
    
    data.data = [serviceInfoDefault._id, defaultComponent._id];
    await serviceInfoDefault.save();
    await defaultComponent.save();
    Page.findByIdAndUpdate(
      req.params.id,
      { $push: {services: data }},
      { upsert: true },
      function (err, result) {
        if (err) {
          return res.status(500).json({
            type: "internal_error",
            error: err.message,
          });
        }
        const itemList = new ComponentModel(req.body);
        itemList.data = [serviceInfoDefault, defaultComponent]
        itemList._id = data._id;
        console.log("data: ", itemList);
        res.status(200).json(itemList);
      }
    );

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.saveInputField = async (req, res) => {
  // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
  helper.addNewComponent(Page, req.body, req.params.parentId, res, 'bookingInfo');
}

module.exports.saveItem = async (req, res) => {
  try {
    // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
    delete req.body._id;
    const newItem = new Item(req.body)
    newItem["serviceId"] = req.params.serviceId;
    newItem["pageId"] = req.params.parentId

    if (newItem.type == "item") {
      const item = makeDefaultItem(req.params.serviceId, req.params.parentId);
      newItem.data = item.data;
    }
    await newItem.save()

    helper.editComponent(Page, { "_id": req.params.parentId, "services._id": req.params.serviceId },
      { $push: { "services.$.data": newItem._id } }, res, newItem);
  } catch (error) {
    console.log(error);
    helper.handleError(error, res);
  }
}


module.exports.addServiceChildComponent = async (req, res) => {
  try {
    delete req.body._id;
    const validComponent = await ComponentModel.validate(req.body);
    Item.updateOne({ "_id": mongoose.Types.ObjectId(req.params.parentId) },
      {
        $push: {
          data: validComponent,
        }
      },
      function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        res.status(200).json(validComponent);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.addComponentImage = (req, res) => {
  // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
  const newImage = new ImageModel({ url: process.env.HOST + req.file.filename });
  helper.editComponent(Page, { "_id": req.params.parentId, "components._id": req.params.childId },
    { $push: { "components.$.data": newImage } }, res, newImage);
}

module.exports.addItemChildComponentImage = (req, res) => {
  try {
    // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
    const newImage = new ImageModel({ url: process.env.HOST + req.file.filename });
    Item.updateOne({ "_id": mongoose.Types.ObjectId(req.params.parentId) },
      {
        $push: {
          "data.$[photo].data": newImage,
        }
      },
      {
        "arrayFilters":
          [
            { "photo._id": mongoose.Types.ObjectId(req.params.childId) }
          ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json(err.message)
        }
        res.status(200).json(newImage);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}


module.exports.editChildComponent = async (req, res) => {
  try {
    const validComponent = await ComponentModel.validate(req.body);
    if (validComponent.type == "photo") {
      validComponent.data = helper.convertIdToObjectId(validComponent);
    } else {
    }
    Item.updateOne({ "_id": req.params.parentId },
      {
        $set: {
          "data.$[child].data": validComponent.data,
          "data.$[child].styles": validComponent.styles,
        }
      },
      {
        "arrayFilters":
          [
            { "child._id": mongoose.Types.ObjectId(req.body._id) }
          ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        res.status(200).json(response);
      })

  } catch (error) {
    console.log(error)
    helper.handleError(error, res);
  }
}

module.exports.deleteChildComponent = (req, res) => { 
    Page.updateOne({ "_id": req.params.parentId },
      {
        $pull: {
          "services.$[parent].data": { "_id": mongoose.Types.ObjectId(req.params.componentId) },
        }
      },
      {
        "arrayFilters": [{ "parent._id": mongoose.Types.ObjectId(req.params.serviceId) }]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        res.status(200).json(response);
      })
}

module.exports.deleteItemChild = (req, res) => {
    Item.updateOne({ "_id": req.params.parentId },
      {
        $pull: {
          "data": { "_id": mongoose.Types.ObjectId(req.params.childId) },
        }
      },function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        if (req.body.images) {
          req.body.images.forEach(image => {
            helper.deletePhoto(image)
          });
        }
        res.status(200).json(response);
      })
}



module.exports.deleteItem = async (req, res) => {
  try {
    // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
    let images = [];

    const item = await Item.findOneAndRemove({_id: req.params.itemId})
    if (item.data && item.type == "item" && item.data.length > 0) {
      images = helper.getItemImages(item)
    }

    Page.updateOne({ "_id": req.params.pageId },
      {
        $pull: {
          "services.$[itemListId].data": mongoose.Types.ObjectId(req.params.itemId),
        }
      },
      {
        "arrayFilters": [
          { "itemListId._id": mongoose.Types.ObjectId(req.params.itemListId) },
        ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        console.log(images);
        images.forEach(image => {
          let img = image.split("/");
          deleteImage(img[img.length - 1]);
        })
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.editServiceInfo = async (req, res) => {
  try {
    const validComponent = await ComponentModel.validate(req.body)
    const test = await Item.findById(req.params.infoId)
    console.log(test);
    Item.updateOne({ "_id": mongoose.Types.ObjectId(req.params.infoId) },
      {
        $set: {
          "data": validComponent.data,
          "styles": validComponent.styles,
        }
      },
      function (err, response) {
        console.log("yehe: ", response)
        if (err) {
          console.log(err);
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.editComponent = async (req, res) => {
  try {
    // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
    const validComponent = await ComponentModel.validate(req.body);
    if (validComponent.type == "photo") {
      validComponent.data = helper.convertIdToObjectId(validComponent);
    } else {
    }
    helper.editComponent(Page, { "_id": req.params.id, "components._id": req.body._id },
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

module.exports.editInputField = async (req, res) => {
  try {
    // const Pages = req.params.pageType == "service" ? servicePage : touristSpotPage
    const validComponent = await ComponentModel.validate(req.body);
    helper.editComponent(Page, { "_id": req.params.parentId, "bookingInfo._id": req.body._id },
      {
        $set: {
          "bookingInfo.$.data": validComponent.data,
          "bookingInfo.$.styles": validComponent.styles
        }
      }, res, validComponent);
  } catch (error) {
    helper.handleError(error, res)
  }
}

module.exports.getItemUpdatedData = async (req, res) => {
  try {
    const result = await helper.getItem(req.params.pageId, req.params.itemId, req.params.pageType);
    res.status(200).json(result);
  } catch (err) {
    helper.handleError(err, res);
  }
}

module.exports.getUpdatedItemListData = (req, res) => {
  Item.find({serviceId: req.params.serviceId}).then((data, err) => {
    if (err) {
      return res.status(500).json({ type: "internal_error", error: err.message })
    }
    res.status(200).json(data);
  })
}


module.exports.deleteComponent = (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  helper.deleteItem(Page,
    { _id: req.params.id },
    { 'components': { '_id': req.params.componentId } }, res, req.body.images)
}

module.exports.deleteInputField = (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  helper.deleteItem(Page,
    { _id: req.params.parentId },
    { 'bookingInfo': { '_id': req.params.childId } }, res, req.body.images)
}

module.exports.deleteServiceComponent = async (req, res) => {
  try {
    // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
    // const result = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
    // let images = [];
    // result[0].services.forEach(item => {
    //   let imgs = helper.getImages(item);
    //   if (imgs.length) {
    //     images = imgs;
    //   }
    // })
    // helper.deleteItem(Pages,
    //   { _id: req.params.pageId },
    //   { 'services': { '_id': req.params.serviceId } }, res, images)
    const items = await Item.find({serviceId: req.params.serviceId})

    const deletedItems = await Item.deleteMany({serviceId: req.params.serviceId})
    console.log("result: ", deletedItems);

    Page.findOneAndUpdate({ _id: req.params.pageId }, {
      $pull: { 'services': { '_id': req.params.serviceId } }
    }, function (err, result) {
      if (err) {
        return res.status(500).json({ type: "internal_error", error: err.message });
      }
      res.status(200).json(result);
    })
  } catch (err) {
    helper.handleError(err, res)
  }
}

module.exports.deleteImage = (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  helper.editComponent(Page, { "_id": req.params.id, "components._id": req.body.componentId },
    {
      $pull: {
        "components.$.data": { "_id": mongoose.Types.ObjectId(req.body.imageId) },
      }
    }, res, { imageUrl: req.body.imageUrl, message: "Successfull deleted" }, helper.deletePhoto);
}

module.exports.deleteItemImage = (req, res) => {
  try {
    Item.updateOne({ "_id": req.params.parentId },
      {
        $pull: {
          "data.$[child].data": { "_id": mongoose.Types.ObjectId(req.body.imageId) },
        }
      },
      {
        "arrayFilters": [
          { "child._id": mongoose.Types.ObjectId(req.body.componentId) }
        ]
      }, function (err, response) {
        if (err) {
          console.log(err)
          return res.status(500).json({ type: "internal error", error: err.message })
        }
        helper.deletePhoto(req.body.imageUrl)
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.createPage = async (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  const hostTouristSpot = req.params.pageType == 'service' ? req.body : null;
  const isService = req.params.pageType == 'service';
  const inputNameLabel = req.params.pageType == 'service' ? "Enter service name here" : "Enter tourist spot name here";
  const initialStatus = req.params.pageType == "tourist_spot" ? "Approved": "Pending"
  makePage(req, res, inputNameLabel, isService, hostTouristSpot, req.params.pageType, initialStatus)
}

module.exports.getDefaultCategories = async (req, res) => {
  const service = req.params.pageType == "service"
  let defaultCategories = []
  if (service) {
    defaultCategories = await serviceCategoriesCrud.addDefaultCategories(req, res);
  } else {
    defaultCategories = await touristSpotCategoriesCrud.addDefaultCategories(req, res);
  }
  res.status(200).json(defaultCategories)
}


async function makePage(req, res, pageNameInputLabel, service, hostTouristSpot, pageType, initialStatus) {
  try {


    //default components for services and offers
    let defaultService = new serviceModel({ type: "item-list",data: [], styles: [], default: false })

    const serviceInfoDefault = new Item({ type: "text", serviceId: defaultService._id, data: { placeholder: "Enter service name or other info here", text: null,defaultName: "name" }, styles: ["bg-light", "text-center", "font-medium", "fontStyle-bold", "color-dark"], default: true })
    const item = makeDefaultItem();
    item.serviceId = defaultService._id;
    
    defaultService.data = [serviceInfoDefault._id, item._id]


    //default components for tourist spot's information
    const photo = new ComponentModel({ type: "photo", data: [], styles: [], default: true })
    const pageName = new ComponentModel({ type: "text", data: { placeholder: pageNameInputLabel, text: null, defaultName: 'pageName' }, styles: ["bg-light", "text-left", "font-large", "fontStyle-bold", "color-dark"], default: true })
    const barangay = new ComponentModel({ type: "labelled-text", data: { label: "Barangay", text: null, defaultName: 'barangay' }, styles: [], default: true })
    const municipality = new ComponentModel({ type: "labelled-text", data: { label: "Municipality", text: service ? hostTouristSpot.municipality : 'Moalboal', defaultName: 'municipality' }, styles: [], default: true })
    const province = new ComponentModel({ type: "labelled-text", data: { label: "Province", text: service ? hostTouristSpot.city : "Cebu", defaultName: "province" }, styles: [], default: true })
    const category = new ComponentModel({ type: "labelled-text", data: { label: "Category", text: null, defaultName: 'category' }, styles: [], default: true })
    const description = new ComponentModel({ type: "text", data: { placeholder: "Enter description here", text: null, defaultName: 'description' }, styles: ["bg-white", "text-left", "font-normal", "fontStyle-normal", "color-light"], default: true })

    //default input fields for booking
    let currentYear = new Date().getFullYear()
    const arrival = new ComponentModel({ type: "date-input", data: { label: "Arrival date", instructions: null, required: true, defaultValue: null, value: null, customYears: [currentYear + 1, currentYear], customMonths: [], customDays: [], customDates: [] }, styles: [], default: false })
    const departure = new ComponentModel({ type: "date-input", data: { label: "Departure date", instructions: null, required: true, defaultValue: null, value: null, customYears: [currentYear + 1, currentYear], customMonths: [], customDays: [], customDates: [] }, styles: [], default: false })
    const adults = new ComponentModel({ type: "number-input", data: { label: "Number of adults", instructions: null, required: true, defaultValue: null, min: 0, max: null }, styles: [], default: false })
    const children = new ComponentModel({ type: "number-input", data: { label: "Number of children", instructions: null, required: true, defaultValue: null, min: 0, max: null }, styles: [], default: false })


    const defaultComponents = [photo, pageName, barangay, municipality, province, category, description];
    const page = new Page({ creator: req.user._id, pageType: pageType, components: defaultComponents, initialStatus: initialStatus, services: defaultService, bookingInfo: [arrival, departure, adults, children] });
    item.pageId = page._id;
    serviceInfoDefault["pageId"] = page._id;
    await item.save()
    await serviceInfoDefault.save();
    if (service) {
      page['hostTouristSpot'] = hostTouristSpot._id;
      Page.updateOne({_id: hostTouristSpot._id}, {$push: {otherServices: page._id}}).then((result, error) => {
        if (error) {
          console.log(error)
          return res.status(500).json(error.message);
        }
      })
    }
    page.save().then((createdPage, error) => {
      if (error) {
        return res.status(500).json({
          type: "internal_error",
          message: "Unexpected error occured!",
          error: error.message
        })
      }
      res.status(200).json(createdPage)
    })
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
}

module.exports.deletePage = async (req, res) => {
  try {
    // let Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
    const page = await Page.findById(req.params.pageId);
    let images = [];
    if (!page) {
      res.status(404).json({ type: "not_found", error: "Tourist spot page not found!" })
    }
    page.components.forEach(comp => {
      if (comp.type == "photo") {
        comp.data.forEach(img => {
          images.push(img.url);
        })
      }
    })
    page.services.forEach(item => {
      let imgs = helper.getImages(item);
      if (imgs.length) {
        images = [...images, ...imgs];
      }
    })
    Page.findByIdAndRemove(req.params.pageId).then((result, error) => {
      if (error) {
        return res.status(500).json({ type: "internal_error", message: "Error occured in deleting tourit spot page!" })
      }
      if (result) {
        images.forEach(image => {
          let img = image.split("/");
          deleteImage(img[img.length - 1]);
        })
        return res.status(200).json({ message: "successfully deleted", result: result })
      }
    })
  } catch (error) {
    res.status(500).json(error.message)
  }
}

module.exports.retrievePage = (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  Page.findOne({ _id: req.params.pageId })
  .populate({ path: "services.data", model: "Item" })
  .populate({ path: "hostTouristSpot", model: "Page" })
  .exec((error, page) => {
    if (error) {
      return res.status(500).json({
        type: "internal_error",
        message: "unexpected error occured!",
        error: error.message
      });
    }
    if (!page) {
      return res.status(404).json({ type: "not_found" })
    }
    res.status(200).json(page);
  })
}

module.exports.retrieveAllTouristSpotsPage = async (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  Page.find({ status: 'Online', pageType: "tourist_spot"}).then((pages, error) => {
    if (error) {
      return res.status(500).json(error.message);
    }
    res.status(200).json(pages)
  })
}

module.exports.submitPage = async (req, res) => {
  // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
  Page.updateOne({ _id: req.params.pageId },
    {
      $set: {
        status: 'Pending',
      }
    }, async function (err, response) {
      if (err) {
        return res.status(500).json({ type: "internal error", error: err.message })
      }
      try {
        console.log("notificationDAta: ",req.body.notificationData);
        if (req.body.notificationData) {
          await helper.createNotification(req.body.notificationData)
        }
         res.status(200).json({ message: "Page successfully submitted" });
 
      } catch(error) {
        console.log(error)
        return res.status(500).json(error.message)
      }
    })
}


module.exports.editServiceSettings = (req, res) => {
  Page.updateOne(
    { "_id": req.body.pageId, "services._id": req.body.serviceId },
    { $set: { "services.$.required": req.body.required, "services.$.selectMultiple": req.body.selectMultiple} })
    .then(result => {
      res.status(200).json(result);
    }).catch(error => {
      res.status(500).json({ type: 'internal_error!', error: error.message });
    })
}
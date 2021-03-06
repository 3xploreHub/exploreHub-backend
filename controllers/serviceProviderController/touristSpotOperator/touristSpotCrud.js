const mongoose = require("mongoose");
const { ComponentModel } = require("../../../models/commonSchemas/component");
const { ImageModel } = require("../../../models/commonSchemas/image");
const ServicePage = require("../../../models/servicePage");
const TouristSpotPage = require("../../../models/touristSpotPage");
const deleteImage = require("../../../uploads/deleteImage");
const helper = require("./helper");
const touristSpotCategoriesCrud = require("./touristSpotCategoriesCrud");
const serviceCategoriesCrud = require("./serviceCategoriesCrud");

module.exports.addComponent = (req, res) => {
  const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
  helper.addNewComponent(Pages, req.body, req.params.id, res, 'components');
}

module.exports.addServiceComponent = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    let serviceInfoDefault = new ComponentModel({ type: "text", data: { placeholder: "Enter service name or other info here", text: null }, styles: ["bg-white", "text-center", "font-medium", "fontStyle-bold", "color-dark"], default: true })
    let photo = new ComponentModel({ type: "photo", data: [], styles: [], default: false })
    let text = new ComponentModel({ type: "text", data: { text: null }, styles: ["bg-light", "text-left", "font-small", "fontStyle-normal", "color-dark"], default: false })
    const defaultComponent = new ComponentModel({ type: "item", styles: [], data: [photo, text], default: false });
    req.body.data = [serviceInfoDefault, defaultComponent];
    helper.addNewComponent(Pages, req.body, req.params.id, res);

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.saveInputField = async (req, res) => {
  const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
  helper.addNewComponent(Pages, req.body, req.params.parentId, res, 'bookingInfo');
}

module.exports.saveItem = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    delete req.body._id;
    const validComponent = await ComponentModel.validate(req.body);

    if (validComponent.type == "item") {
      let defaultPhoto = { type: "photo", data: [], styles: [], default: false }
      let defaultText = { type: "text", data: { text: null }, styles: ["bg-light", "text-left", "font-medium", "fontStyle-normal", "color-dark"], default: false }

      let photo = new ComponentModel(defaultPhoto)
      let text = new ComponentModel(defaultText)
      validComponent.data = [photo, text]
    }

    helper.editComponent(Pages, { "_id": req.params.parentId, "services._id": req.params.serviceId },
      { $push: { "services.$.data": validComponent } }, res, validComponent);
  } catch (error) {
    helper.handleError(error, res);
  }
}


module.exports.addServiceChildComponent = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    delete req.body._id;
    const validComponent = await ComponentModel.validate(req.body);
    Pages.updateOne({ "_id": req.params.pageId },
      {
        $push: {
          "services.$[grandParent].data.$[parent].data": validComponent,
        }
      },
      {
        "arrayFilters": [{ "grandParent._id": mongoose.Types.ObjectId(req.params.grandParentId) }, { "parent._id": mongoose.Types.ObjectId(req.params.parentId) }]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err })
        }
        res.status(200).json(validComponent);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.addComponentImage = (req, res) => {
  const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
  const newImage = new ImageModel({ url: process.env.HOST + req.file.filename });
  helper.editComponent(Pages, { "_id": req.params.parentId, "components._id": req.params.childId },
    { $push: { "components.$.data": newImage } }, res, newImage);
}

module.exports.addItemChildComponentImage = (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    const newImage = new ImageModel({ url: process.env.HOST + req.file.filename });
    Pages.updateOne({ "_id": req.params.pageId },
      {
        $push: {
          "services.$[grandParent].data.$[parent].data.$[child].data": newImage,
        }
      },
      {
        "arrayFilters":
          [
            { "grandParent._id": mongoose.Types.ObjectId(req.params.grandParentId) },
            { "parent._id": mongoose.Types.ObjectId(req.params.parentId) },
            { "child._id": mongoose.Types.ObjectId(req.params.childId) }
          ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json(err)
        }
        res.status(200).json(newImage);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}


module.exports.editChildComponent = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    const validComponent = await ComponentModel.validate(req.body);
    if (validComponent.type == "photo") {
      validComponent.data = helper.convertIdToObjectId(validComponent);
    } else {
      console.log("not array");
    }
    Pages.updateOne({ "_id": req.params.pageId },
      {
        $set: {
          "services.$[grandparent].data.$[parent].data.$[child].data": validComponent.data,
          "services.$[grandparent].data.$[parent].data.$[child].styles": validComponent.styles,
        }
      },
      {
        "arrayFilters":
          [
            { "grandparent._id": mongoose.Types.ObjectId(req.params.grandParentId) },
            { "parent._id": mongoose.Types.ObjectId(req.params.parentId) },
            { "child._id": mongoose.Types.ObjectId(req.body._id) }
          ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err })
        }
        res.status(200).json(response);
      })

  } catch (error) {
    console.log(error)
    helper.handleError(error, res);
  }
}

module.exports.deleteChildComponent = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    Pages.updateOne({ "_id": req.params.parentId },
      {
        $pull: {
          "services.$[parent].data": { "_id": mongoose.Types.ObjectId(req.params.componentId) },
        }
      },
      {
        "arrayFilters": [{ "parent._id": mongoose.Types.ObjectId(req.params.serviceId) }]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err })
        }
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.deleteItemChild = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    Pages.updateOne({ "_id": req.params.pageId },
      {
        $pull: {
          "services.$[grandParent].data.$[parent].data": { "_id": mongoose.Types.ObjectId(req.params.childId) },
        }
      },
      {
        "arrayFilters": [
          { "grandParent._id": mongoose.Types.ObjectId(req.params.grandParentId) },
          { "parent._id": mongoose.Types.ObjectId(req.params.parentId) }

        ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err })
        }
        if (req.body.images) {
          req.body.images.forEach(image => {
            helper.deletePhoto(image)
          });
        }
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}



module.exports.deleteItem = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    let images = [];
    const result = await helper.getItem(req.params.pageId, req.params.itemId);
    images = helper.getImages(result[0].services[0])
    console.log(images);

    Pages.updateOne({ "_id": req.params.pageId },
      {
        $pull: {
          "services.$[itemListId].data": { "_id": mongoose.Types.ObjectId(req.params.itemId) },
        }
      },
      {
        "arrayFilters": [
          { "itemListId._id": mongoose.Types.ObjectId(req.params.itemListId) },
        ]
      }, function (err, response) {
        if (err) {
          return res.status(500).json({ type: "internal error", error: err })
        }
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
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    const validComponent = await ComponentModel.validate(req.body)
    Pages.updateOne({ "_id": req.params.pageId },
      {
        $set: {
          "services.$[parent].data.$[info].data": validComponent.data,
          "services.$[parent].data.$[info].styles": validComponent.styles,
        }
      },
      {
        "arrayFilters": [
          { "parent._id": mongoose.Types.ObjectId(req.params.serviceId) },
          { "info._id": mongoose.Types.ObjectId(req.params.infoId) }
        ]
      }, function (err, response) {
        if (err) {
          console.log(err);
          return res.status(500).json({ type: "internal error", error: err })
        }
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.editComponent = async (req, res) => {
  try {
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    const validComponent = await ComponentModel.validate(req.body);
    if (validComponent.type == "photo") {
      validComponent.data = helper.convertIdToObjectId(validComponent);
    } else {
      console.log("not array");
    }
    console.log(typeof validComponent.data);
    helper.editComponent(Pages, { "_id": req.params.id, "components._id": req.body._id },
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
    const Pages = req.params.pageType == "service" ? ServicePage : TouristSpotPage
    const validComponent = await ComponentModel.validate(req.body);
    helper.editComponent(Pages, { "_id": req.params.parentId, "bookingInfo._id": req.body._id },
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
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  Pages.aggregate([
    {
      "$match": { _id: mongoose.Types.ObjectId(req.params.pageId) }
    },
    {
      "$project": {
        "services": {
          "$filter": {
            "input": "$services",
            "as": "data",
            "cond": { "$eq": ["$$data._id", mongoose.Types.ObjectId(req.params.serviceId)] }
          }
        }
      }
    }
  ], function (err, data) {
    if (err) {
      return res.status(500).json({ type: "internal_error", error: err })
    }
    res.status(200).json(data);
  })
}


module.exports.deleteComponent = (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  helper.deleteItem(Pages,
    { _id: req.params.id },
    { 'components': { '_id': req.params.componentId } }, res, req.body.images)
}

module.exports.deleteInputField = (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  helper.deleteItem(Pages,
    { _id: req.params.parentId },
    { 'bookingInfo': { '_id': req.params.childId } }, res, req.body.images)
}

module.exports.deleteServiceComponent = async (req, res) => {
  try {
    const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
    const result = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
    let images = [];
    result[0].services.forEach(item => {
      let imgs = helper.getImages(item);
      if (imgs.length) {
        images = imgs;
      }
    })
    helper.deleteItem(Pages,
      { _id: req.params.pageId },
      { 'services': { '_id': req.params.serviceId } }, res, images)
  } catch (err) {
    helper.handleError(err, res)
  }
}

module.exports.deleteImage = (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  helper.editComponent(Pages, { "_id": req.params.id, "components._id": req.body.componentId },
    {
      $pull: {
        "components.$.data": { "_id": mongoose.Types.ObjectId(req.body.imageId) },
      }
    }, res, { imageUrl: req.body.imageUrl, message: "Successfull deleted" }, helper.deletePhoto);
}

module.exports.deleteItemImage = (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  try {
    Pages.updateOne({ "_id": req.params.pageId },
      {
        $pull: {
          "services.$[grandParent].data.$[parent].data.$[child].data": { "_id": mongoose.Types.ObjectId(req.body.imageId) },
        }
      },
      {
        "arrayFilters": [
          { "grandParent._id": mongoose.Types.ObjectId(req.params.grandParentId) },
          { "parent._id": mongoose.Types.ObjectId(req.params.parentId) },
          { "child._id": mongoose.Types.ObjectId(req.body.componentId) }
        ]
      }, function (err, response) {
        if (err) {
          console.log(err)
          return res.status(500).json({ type: "internal error", error: err })
        }
        helper.deletePhoto(req.body.imageUrl)
        res.status(200).json(response);
      })

  } catch (error) {
    helper.handleError(error, res);
  }
}

module.exports.createPage = async (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  const hostTouristSpot = req.params.pageType == 'service' ? req.body : null;
  const isService = req.params.pageType == 'service';
  const inputNameLabel = req.params.pageType == 'service' ? "Enter service name here" : "Enter tourist spot name here";
  makePage(req, res, Pages, inputNameLabel, isService, hostTouristSpot)
}


async function makePage(req, res, Page, pageNameInputLabel, service, hostTouristSpot) {
  let serviceCategoriesName;
  let spotCategoriesName;

  if (service) {
    serviceCategoriesName = await serviceCategoriesCrud.addDefaultCategories(req, res);
  } else {
    spotCategoriesName = await touristSpotCategoriesCrud.addDefaultCategories(req, res);
  }

  //default components for services and offers
  let servicePhoto = new ComponentModel({ type: "photo", data: [], styles: [], default: false })
  let serviceText = new ComponentModel({ type: "text", data: { text: null }, styles: ["bg-white", "text-left", "font-small", "fontStyle-normal", "color-dark"], default: false })
  let validComponent = new ComponentModel({ type: "item", styles: [], data: [servicePhoto, serviceText], default: false })
  let serviceInfoDefault = new ComponentModel({ type: "text", data: { placeholder: "Enter service name or other info here", text: null }, styles: ["bg-light", "text-center", "font-medium", "fontStyle-bold", "color-dark"], default: false })

  //default components for tourist spot's information
  let photo = new ComponentModel({ type: "photo", data: [], styles: [], default: true })
  let name = new ComponentModel({ type: "text", data: { placeholder: pageNameInputLabel, text: null }, styles: ["bg-light", "text-left", "font-large", "fontStyle-bold", "color-dark"], default: true })
  let barangay = new ComponentModel({ type: "labelled-text", data: { label: "Barangay", text: null }, styles: [], default: true })
  let municipality = new ComponentModel({ type: "labelled-text", data: { label: "Municipality", text: service ? hostTouristSpot.municipality : 'Moalboal' }, styles: [], default: true })
  let province = new ComponentModel({ type: "labelled-text", data: { label: "Province", text: service ? hostTouristSpot.city : "Cebu" }, styles: [], default: true })
  let category = new ComponentModel({ type: "labelled-text", data: { label: "Category", text: null, defaults: service ? serviceCategoriesName : spotCategoriesName }, styles: [], default: true })
  let description = new ComponentModel({ type: "labelled-text", data: { label: "Description", text: null }, styles: [], default: true })
  const defaultService = await ComponentModel.validate({ type: "item-list", styles: [], data: [serviceInfoDefault, validComponent], default: false })

  //default input fields for booking
  let currentYear = new Date().getFullYear()
  let arrival = new ComponentModel({ type: "date-input", data: { label: "Arrival date", instructions: null, required: true, defaultValue: null, value: null, customYears: [currentYear + 1, currentYear], customMonths: [], customDays: [], customDates: [] }, styles: [], default: false })
  let departure = new ComponentModel({ type: "date-input", data: { label: "Departure date", instructions: null, required: true, defaultValue: null, value: null, customYears: [currentYear + 1, currentYear], customMonths: [], customDays: [], customDates: [] }, styles: [], default: false })
  let adults = new ComponentModel({ type: "number-input", data: { label: "Number of adults", instructions: null, required: true, defaultValue: null, min: 0, max: null }, styles: [], default: false })
  let children = new ComponentModel({ type: "number-input", data: { label: "Number of children", instructions: null, required: true, defaultValue: null, min: 0, max: null }, styles: [], default: false })


  let defaultComponents = [photo, name, barangay, municipality, province, category, description];
  const page = new Page({ creator: req.user._id, components: defaultComponents, services: defaultService, bookingInfo: [arrival, departure, adults, children] });

  if (service) {
    page['hostTouristSpot'] = hostTouristSpot._id;
  }
  page.save().then((createdPage, error) => {
    if (error) {
      return res.status(500).json({
        type: "internal_error",
        message: "Unexpected error occured!",
        error: error
      })
    }
    res.status(200).json(createdPage)
  })
}

module.exports.deletePage = async (req, res) => {
  try {
    let Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
    const page = await Pages.findById(req.params.pageId);
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
    Pages.findByIdAndRemove(req.params.pageId).then((result, error) => {
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
    res.status(500).json(error)
  }
}

module.exports.retrievePage = (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  Pages.findById(req.params.pageId).then((page, error) => {
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

module.exports.retrieveAllTouristSpotsPage = async (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  Pages.find({ status: 'approved' }).then((pages, error) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.status(200).json(pages)
  })
}

module.exports.submitPage = async (req, res) => {
  const Pages = req.params.pageType == 'service' ? ServicePage : TouristSpotPage;
  Pages.updateOne({ _id: req.params.pageId },
    {
      $set: {
        status: 'pending',
      }
    }, function (err, response) {
      if (err) {
        return res.status(500).json({ type: "internal error", error: err })
      }
      res.status(200).json({ message: "Page successfully submitted" });
    })
}

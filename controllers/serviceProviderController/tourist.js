const mongoose = require("mongoose");
const booking = require("../../models/booking");
const { inputValueModel } = require("../../models/commonSchemas/inputValue");
const { selectedServiceModel } = require("../../models/commonSchemas/selectedService");
const { Item } = require("../../models/item");
const Page = require("../../models/page");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");
const helper = require("./helper");

module.exports.getOnlinePages = async (req, res) => {
    try {
        const pages = await Page.aggregate([{ $match: { status: { $eq: 'Online' } } }]);
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error)
    }
}



module.exports.viewPage = (req, res) => {
    Page.findOne({ _id: req.params.pageId })
    .populate({ path: "services.data", model: "Item" })
    .populate({path: "otherServices", model: "Page"})
    .exec((error, page) => {
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

module.exports.viewAllServices = async (req, res) => {
    try {
        const otherServices = await Page.find({ hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId) })
        res.status(200).json(otherServices);
    }
    catch (error) {
        res.status(500).json(500);
    }
}

module.exports.viewItems = async (req, res) => {
    try {
        // const service = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
        const service = await Item.find({ serviceId: req.params.serviceId })
        res.status(200).json(service);
    }
    catch (err) {
        helper.handleError(error);
    }
}

module.exports.createBooking = async (req, res) => {
    try {
        if (req.params.bookingId == "create_new") {
            const newBooking = new booking({ tourist: req.user._id, pageId: req.params.pageId, bookingInfo: [], selectedServices: [], bookingType: req.params.pageType });
            if (req.body.firstService) {
                const selectedService = new selectedServiceModel(req.body.firstService);
                newBooking.selectedServices.push(selectedService)
            }
            const savedBooking = await newBooking.save();
            res.status(200).json(savedBooking);
        } else {
            const selectedService = new selectedServiceModel(req.body.firstService);
            booking.updateOne({ _id: req.params.bookingId },
                {
                    $push: {
                        selectedServices: selectedService
                    }
                }).then(async (result) => {
                    const bookingData = await booking.findById(req.params.bookingId);
                    res.status(200).json(bookingData);
                })
        }
    }

    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.getBooking = async (req, res) => {
    try {
        // const bookingData = await booking.findById(req.params.bookingId);
        console.log("booking:Id: ", req.params.bookingId);
        booking.findOne({ _id: req.params.bookingId })
            .populate({ path: "selectedServices.service", model: "Item" })
            .exec((error, bookingData) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json(error);
                }

                // const Pages = bookingData.bookingType == "service" ? servicePage : touristSpotPage;
                const result = { bookingData: bookingData };
                if (req.params.purpose == "add_services") {
                    Page.findOne({ _id: bookingData.pageId }, { services: 1, _id: 0 })
                        .populate({ path: "services.data", model: "Item" }).exec((error, page) => {
                            if (error) {
                                return res.status(500).json(error)
                            }
                            result["services"] = page.services
                            return res.status(200).json(result);
                        })
                } else {

                    res.status(200).json(result);
                }
            })
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.addBookingInfo = (req, res) => {
    const bookingInfo = [];
    req.body.forEach(inputValue => {
        const inputVal = new inputValueModel(inputValue);
        bookingInfo.push(inputVal);
    });

    booking.updateOne({ _id: req.params.bookingId },
        {
            $set: {
                bookingInfo: bookingInfo
            }
        }).then(async (result) => {
            const bookingData = await booking.findById(req.params.bookingId);
            res.status(200).json(bookingData);
        })

}

module.exports.getPageBookingInfo = async (req, res) => {
    try {
        // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
        const page = await Page.findOne({ _id: req.params.pageId }, { bookingInfo: 1 });
        const bookingData = await booking.findOne({ _id: req.params.bookingId });
        res.status(200).json({ bookingInfo: page.bookingInfo, booking: bookingData })
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.submitBooking = (req, res) => {
    booking.updateOne({ _id: req.params.bookingId },
        {
            $set: {
                status: "Pending"
            }
        }).then((result, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json(result);
        })
}

module.exports.getBookings = (req, res) => { //KIHANGLAN I AGGREGATE.******************************************
    booking.find({ tourist: req.user._id , status: req.params.bookingStatus}) 
    .populate({path: "pageId", model: "Page", select: "components"})
    .populate({path:"selectedServices.service", model: "Item"})
    .exec((error, bookings) => {
        if (error) {
           return res.status(500).json(error);
        }
        res.status(200).json(bookings);
    })

}

module.exports.viewBooking = (req, res) => {
    booking.findOne({_id: req.params.bookingId})
    .populate({path: "pageId", model: "Page", select: "components"})
    .populate({path:"selectedServices.service", model: "Item"})
    .exec((error, bookings) => {
        if (error) {
           return res.status(500).json(error);
        }
        res.status(200).json(bookings);
    })
}

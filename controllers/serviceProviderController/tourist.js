const mongoose = require("mongoose");
const booking = require("../../models/booking");
const { inputValueModel } = require("../../models/commonSchemas/inputValue");
const { selectedServiceModel } = require("../../models/commonSchemas/selectedService");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");
const helper = require("./helper");

module.exports.getOnlinePages = async (req, res) => {
    try {
        const pages = await touristSpotPage.aggregate([{ $match: { status: { $eq: 'Online' } } }]);
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.viewPage = async (req, res) => {
    try {
        const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
        const page = await Pages.findById(req.params.pageId);
        let otherServices = []
        if (req.params.pageType == "tourist_spot") {
            otherServices = await servicePage.find({ hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId) })
        }

        if (!page) {
            return res.status(404).json({ message: "Page not found!" })
        }
        res.status(200).json({ page: page, otherServices: otherServices });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.viewAllServices = async (req, res) => {
    try {
        const otherServices = await servicePage.find({ hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId) })
        res.status(200).json(otherServices);
    }
    catch (error) {
        res.status(500).json(500);
    }
}

module.exports.viewItems = async (req, res) => {
    try {
        const service = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
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
        const bookingData = await booking.findById(req.params.bookingId);
        const result = { bookingData: bookingData };
        if (req.params.purpose == "add_services") {
            const services = await touristSpotPage.findOne({ _id: bookingData.pageId }, { services: 1, _id: 0 })
            result["services"] = services.services
        }
        res.status(200).json(result);
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
        const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
        const page = await Pages.findOne({_id: req.params.pageId}, {bookingInfo: 1});
        const bookingData = await booking.findOne({_id: req.params.bookingId});
        res.status(200).json({bookingInfo: page.bookingInfo, booking: bookingData})
    }
    catch(error) {
        console.log(error);
        res.status(500).json(error);
    }
}
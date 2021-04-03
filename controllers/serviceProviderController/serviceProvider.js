const mongoose = require("mongoose");
const booking = require("../../models/booking");
const Page = require("../../models/page");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");


module.exports.getPages = async (req, res) => {
    try {
        let cond = { creator: { $eq: mongoose.Types.ObjectId(req.user._id) }, status: { $eq: 'Unfinished' } }
        if (req.params.status == "submitted") cond.status = { $ne: 'Unfinished' }
        const services = await Page.aggregate([{ $match: cond }]);
        res.status(200).json(services)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.getPage = async (req, res) => {
    Page.findById(req.params.pageId).then((page, error) => {
        if (error) {
            return res.status(500).json(error)
        }
        if (!page) {
            res.status(404).json({ message: "Page not found!" })
        }
        return res.status(200).json(page);
    })
}

module.exports.getServices = (req, res) => {
    Page.findOne({ _id: req.params.pageId }, { services: 1 })
    .populate({path: "services.data", model: "Item"})
    .exec((error, services) => {
        if (error) {
            return res.status(500).json(error)
        }
        return res.status(200).json(services);
    })
}

module.exports.getPageBooking = (req, res) => {
    booking.find({ pageId: req.params.pageId, status: req.params.bookingStatus}) 
    .populate({path: "tourist", model: "Account", select: "firstName lastName"})
    .populate({path:"selectedServices.service", model: "Item"})
    .exec((error, bookings) => {
        if (error) {
           return res.status(500).json(error);
        }
        res.status(200).json(bookings);
    })
}

module.exports.approveBooking = (req, res) => {
    
}


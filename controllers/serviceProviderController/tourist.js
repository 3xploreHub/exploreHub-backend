const mongoose = require("mongoose");
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
            otherServices = await servicePage.find({hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId)})
        }
        
        if (!page) {
            return res.status(404).json({message: "Page not found!"})
        }
        res.status(200).json({page: page, otherServices: otherServices});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.viewAllServices = async (req, res) => {
    try {
        const otherServices = await servicePage.find({hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId)})
        res.status(200).json(otherServices);
    }
    catch(error) {
        res.status(500).json(500);
    }
}

module.exports.viewItems = async (req, res) => {
    try {
        const service = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
        res.status(200).json(service);
    }  
    catch(err) {
        helper.handleError(error);
    }
}

module.exports.createBookingSession = (req, res) => {
    try {

    }
    catch(error) {

    }
}
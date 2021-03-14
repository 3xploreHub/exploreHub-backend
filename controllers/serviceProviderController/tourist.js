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
        const page = await touristSpotPage.findById(req.params.pageId);
        if (!page) {
            res.status(404).json({message: "Page not found!"})
        }
        res.status(200).json(page);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports.viewItems = async (req, res) => {
    try {
        console.log(req.params.pageId, req.params.serviceId, req.params.pageType);
        const service = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
        res.status(200).json(service);
    }  
    catch(err) {
        helper.handleError(error);
    }
}
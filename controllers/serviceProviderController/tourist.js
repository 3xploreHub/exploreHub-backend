const mongoose = require("mongoose");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");


module.exports.getOnlinePages = async (req, res) => {
    try {
        const pages = await touristSpotPage.aggregate([{ $match: { status: { $eq: 'Online' } } }]);
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error)
    }
}
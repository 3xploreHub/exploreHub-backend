const mongoose = require("mongoose");
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");


module.exports.getPages = async (req, res) => {
    try {
        let cond = { creator: { $eq: mongoose.Types.ObjectId(req.user._id) }, status: { $eq: 'Unfinished' } }
        if (req.params.status == "submitted") cond.status = { $ne: 'Unfinished' }
        const services = await servicePage.aggregate([{ $match: cond }]);
        const touristSpots = await touristSpotPage.aggregate([{ $match: cond }]);
        const pages = [...services, ...touristSpots];
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.getPage = async (req, res) => {
    const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
    Pages.findById(req.params.pageId).then((page, error) => {
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
    const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
    Pages.findOne({ _id: req.params.pageId }, { services: 1 }).then((services, error) => {
        if (error) {
            return res.status(500).json(error)
        }
        return res.status(200).json(services);
    })
}

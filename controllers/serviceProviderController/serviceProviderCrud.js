const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");


module.exports.getPages = async (req, res) => {
    try {
        const services = await servicePage.find({ creator: req.user._id });
        const touristSpots = await touristSpotPage.find({ creator: req.user._id });
        const pages = [...services, ...touristSpots];
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error)
    }
}
const servicePage = require("../../models/servicePage");
const touristSpotPage = require("../../models/touristSpotPage");


module.exports.getPages = async (req, res) => {
    try {
        const services = await servicePage.find({ creator: req.user._id });
        const touristSpots = await touristSpotPage.aggregate([{ $match: { status: { $ne: 'unfinished' } } }]);
        const pages = [...services, ...touristSpots];
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.getPage = async (req, res) => {
    const Pages = req.params.pageType == 'service'? servicePage: touristSpotPage;
    Pages.findById(req.params.pageId).then((page, error) => {
        if (error) {
            return res.status(500).json(error)
        }
        if (!page) {
            res.status(404).json({message: "Page not found!"})
        }
        return res.status(200).json(page);
    })
}
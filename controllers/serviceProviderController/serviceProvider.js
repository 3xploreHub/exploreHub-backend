const mongoose = require("mongoose");
const booking = require("../../models/booking");
const { messageModel } = require("../../models/commonSchemas/message");
const conversation = require("../../models/conversation");
const notification = require("../../models/notification");
const Page = require("../../models/page");
const helper = require("./helper");

module.exports.getPages = async (req, res) => {
    try {
        let cond = { creator: { $eq: mongoose.Types.ObjectId(req.user._id) }, status: { $eq: 'Unfinished' } }
        if (req.params.status == "submitted") cond.status = { $ne: 'Unfinished' }
        const services = await Page.aggregate([{ $match: cond }]);
        res.status(200).json(services)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

module.exports.getPage = async (req, res) => {
    Page.findById(req.params.pageId).then((page, error) => {
        if (error) {
            return res.status(500).json(error.message)
        }
        if (!page) {
            res.status(404).json({ message: "Page not found!" })
        }
        return res.status(200).json(page);
    })
}

module.exports.getServices = (req, res) => {
    Page.findOne({ _id: req.params.pageId }, { services: 1 })
        .populate({ path: "services.data", model: "Item" })
        .exec((error, services) => {
            if (error) {
                return res.status(500).json(error.message)
            }
            return res.status(200).json(services);
        })
}

module.exports.getPageBooking = (req, res) => {
    booking.find({ pageId: req.params.pageId, status: req.params.bookingStatus })
        .populate({ path: "tourist", model: "Account", select: "firstName lastName" })
        .populate({ path: "selectedServices.service", model: "Item" })
        .sort({ 'updatedAt': -1 })
        .exec((error, bookings) => {
            if (error) {
                return res.status(500).json(error.message);
            }
            res.status(200).json(bookings);
        })
}

module.exports.approveBooking = (req, res) => {

}

module.exports.getNotificationsCount = (req, res) => {
    notification.countDocuments({
        'receiver': mongoose.Types.ObjectId(req.user._id),
        'opened': false
    }, function (err, docs) {
        if (err) return res.status(500).json(err.message)
        res.status(200).json(docs)
    });
}


module.exports.createConversation = (req, res) => {
    const data = req.body
    const fullName = req.user && req.user.username && !req.user.fullName ? "Admin" : req.user.fullName
    const firstMessage = new messageModel({ sender: req.user._id, senderFullName: fullName, message: data.message })
    const message = new conversation({
        booking: data.booking,
        page: data.page,
        receiver: data.receiver,
        messages: [firstMessage],
    })

    message.save().then(async (message) => {
        try {
            await helper.createNotification(data.notificationData)
        } catch (error) {
        }
        res.status(200).json(message);
    }).catch(error => {
        res.status(500).json(error.message)
    })
}

module.exports.getConversation = async (req, res) => {
    try {
        const conv = await conversation.findOne({ page: req.params.pageId, booking: req.params.bookingId, receiver: req.params.receiver })
        if (!conv) return res.status(200).json({ noConversation: true, message: "no converstion yet!" })
        res.status(200).json(conv)
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}

module.exports.sendMessage = (req, res) => {
    const fullName = req.user && req.user.username && !req.user.fullName ? "Admin" : req.user.fullName
    const message = new messageModel({ sender: req.user._id, senderFullName: fullName, message: req.body.message })
    conversation.updateOne({ "_id": mongoose.Types.ObjectId(req.body.conversationId) },
        {
            $push: {
                messages: message,
            }
        },
        async function (err, response) {
            if (err) {
                return res.status(500).json({ type: "internal error", error: err.message })
            }
            try {
                await helper.createNotification(req.body.notificationData)
                const convo = await conversation.findById(req.body.conversationId)
                res.status(200).json(convo);
            } catch (error) {
                console.log(error)
                res.status(500).json({error: error.message})
            }
        })
}
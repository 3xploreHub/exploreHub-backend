const mongoose = require("mongoose");
const adminAccount = require("../../models/adminSchemas/adminAccount");
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
            data.notificationData["conversation"] = message._id
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
                req.body.notificationData["conversation"] = req.body.conversationId
                if (req.body.notificationData) await helper.createNotification(req.body.notificationData)
                const convo = await conversation.findById(req.body.conversationId)
                res.status(200).json(convo);
            } catch (error) {
                console.log(error)
                res.status(500).json({ error: error.message })
            }
        })
}

module.exports.changePageStatus = (req, res) => {
    Page.updateOne({
        _id: req.body.pageId
    }, {
        $set: {
            status: req.body.status
        }
    }, function (error, response) {
        if (error) {
            return res.status(500).json(error.message)
        }
        res.status(200).json(response)
    })
}

module.exports.getHostedPages = async (req, res) => {
    try {
        const pages = await Page.find({ hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId) })
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

module.exports.changeInitialStatus = (req, res) => {
    Page.updateOne({
        _id: mongoose.Types.ObjectId(req.body.pageId)
    }, {
        $set: {
            initialStatus: req.body.status
        }
    }, function (error, result) {
        if (error) return res.status(500).json(error.message)
        res.status(200).json(result)
    })
}

module.exports.getPageConversation = (req, res) => {
    conversation.findOne({ _id: req.params.conversationId })
        .populate({ path: "receiver", model: "Account" })
        .populate({ path: "page", model: "Page" })
        .exec((error, conversation) => {
            if (error) return res.status(500).json(error.message)
            if (!conversation) res.status(200).json({})

            if (!conversation.receiver) {
                adminAccount.find({}).then(account => {
                    conversation.receiver = account.length > 0 ? account[0] : { fullName: "Admin" }
                    return res.status(200).json(conversation)
                }).catch(error => {
                    return res.status(500).json(error.message)
                })
            } else {

                res.status(200).json(conversation)
            }
        })
}


module.exports.getConvoForPageSubmission = (req, res) => {
    conversation.findOne({ page: req.params.pageId, type: req.params.type })
        .populate({ path: "page", model: "Page" })
        .exec((error, conversation) => {
            if (error) return res.status(500).json(error.message)
            conversation = conversation ? conversation : { noConversation: true }
            res.status(200).json(conversation)
        })
}

module.exports.createConvoForPageSubmission = (req, res) => {
    const data = req.body
    const fullName = req.user && req.user.username && !req.user.fullName ? "Admin" : req.user.fullName
    const firstMessage = new messageModel({ sender: req.user._id, senderFullName: fullName, message: data.message })
    const message = new conversation({
        booking: data.booking,
        page: data.page,
        receiver: data.receiver,
        type: data.type,
        messages: [firstMessage],
    })

    message.save().then(async (message) => {
        try {
            data.notificationData["conversation"] = message._id
            await helper.createNotification(data.notificationData)
        } catch (error) {
        }
        res.status(200).json(message);
    }).catch(error => {
        res.status(500).json(error.message)
    })
}

module.exports.getAllConversations = (req, res) => {
    conversation.find({ page: mongoose.Types.ObjectId(req.params.pageId), booking: { $eq: null } })
        .populate({ path: "receiver", model: "Account", select: "fullName" })
        .sort({ 'updatedAt': -1 })
        .exec((error, convos) => {
            if (error) return res.status(500).json(error.message)
            res.status(200).json(convos)
        })
}


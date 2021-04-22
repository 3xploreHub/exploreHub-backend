const mongoose = require("mongoose");
const booking = require("../../models/booking");
const { inputValueModel } = require("../../models/commonSchemas/inputValue");
const { selectedServiceModel } = require("../../models/commonSchemas/selectedService");
const { Item } = require("../../models/item");
const message = require("../../models/conversation");
const notification = require("../../models/notification");
const Page = require("../../models/page");
const { service } = require("../../models/service");
const helper = require("./helper");
const notificationGroup = require("../../models/notificationGroup");
const adminAccount = require("../../models/adminSchemas/adminAccount");


module.exports.getOnlinePages = async (req, res) => {
    Page.aggregate([{ $match: { status: { $eq: 'Online' } } },
    { $lookup: { from: 'accounts', localField: 'creator', foreignField: '_id', as: 'pageCreator' } }
    ]).exec(function (err, pages) {
        if (err) {
            res.status(500).json(err.message);
        }
        res.status(200).json(pages)
    })
}

module.exports.viewPage = (req, res) => {
    Page.findOne({ _id: req.params.pageId })
        .populate({ path: "services.data", model: "Item" })
        .populate({ path: "otherServices", model: "Page" })
        .exec((error, page) => {
            if (error) {
                return res.status(500).json({
                    type: "internal_error",
                    message: "unexpected error occured!",
                    error: error.message
                });
            }
            if (!page) {
                return res.status(404).json({ type: "not_found" })
            }
            res.status(200).json(page);
        })
}

module.exports.viewAllServices = async (req, res) => {
    try {
        const otherServices = await Page.find({ hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId) })
        res.status(200).json(otherServices);
    }
    catch (error) {
        res.status(500).json(error.message);
    }
}

module.exports.viewItems = async (req, res) => {
    try {
        // const service = await helper.getService(req.params.pageId, req.params.serviceId, req.params.pageType);
        const service = await Item.find({ serviceId: req.params.serviceId })
        res.status(200).json(service);
    }
    catch (err) {
        helper.handleError(error);
    }
}

module.exports.createBooking = async (req, res) => {
    try {
        console.log("req.body: ", req.body)
        if (req.params.bookingId == "create_new") {
            const isManual = req.body.isManual
            const newBooking = new booking({ tourist: req.user._id, pageId: req.params.pageId, isManual: isManual == true, bookingInfo: [], selectedServices: [], bookingType: req.params.pageType });
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
        res.status(500).json(error.message);
    }
}

module.exports.getBooking = async (req, res) => {
    try {
        booking.findOne({ _id: req.params.bookingId })
            .populate({ path: "selectedServices.service", model: "Item" })
            .populate({ path: "pageId", model: "Page" })
            .populate({ path: "tourist", model: "Account", select: "firstName lastName" })
            .exec((error, bookingData) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json(error.message);
                }

                const result = { bookingData: bookingData };
                if (req.params.purpose == "add_services") {
                    Page.findOne({ _id: bookingData.pageId }, { services: 1, _id: 0 })
                        .populate({ path: "services.data", model: "Item" }).exec((error, page) => {
                            if (error) {
                                return res.status(500).json(error.message)
                            }
                            result["services"] = page.services
                            return res.status(200).json(result);
                        })
                } else {

                    res.status(200).json(result);
                }
            })
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error.message);
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
        // const Pages = req.params.pageType == 'service' ? servicePage : touristSpotPage;
        const page = await Page.findOne({ _id: req.params.pageId }, { bookingInfo: 1 });
        const bookingData = await booking.findOne({ _id: req.params.bookingId });
        res.status(200).json({ bookingInfo: page.bookingInfo, booking: bookingData })
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
}

module.exports.submitBooking = async (req, res) => {
    try {
        const adminAcc = await adminAccount.find({})
        const admin = adminAcc.length > 0 ? adminAcc[0]: {_id: "605839a8268f4b69047e4bb1"}
        console.log(admin)
        if (req.body.isManual) {
            if (req.body.selectedServices) {
                req.body.selectedServices.forEach(service => {
                    Item.updateOne({
                        _id: mongoose.Types.ObjectId(service._id)
                    }, {
                        $set: {
                            manuallyBooked: service.manuallyBooked
                        }
                    }).then(result => {
                        console.log("updated item ", service)
                    }).catch(error => {
                        return res.status(500).json(error.message)
                    })
                })
            }
        } else {
            const message = req.body.resubmitted ? `${req.user.fullName} resubmitted his booking` : `${req.user.fullName} submitted a booking`
            await helper.createNotification({
                receiver: req.body.receiver,
                mainReceiver: req.user._id,
                page: req.body.page,
                booking: req.body.booking,
                type: req.body.type,
                message: message
            })
            await helper.createNotification({
                receiver: admin._id,
                mainReceiver: req.user._id,
                page: req.body.page,
                booking: req.body.booking,
                type: req.body.type,
                message: message
            })
        }
        const status = req.body.isManual ? "Booked" : "Pending"
        booking.updateOne({ _id: req.params.bookingId },
            {
                $set: {
                    status: status
                }
            }).then((result, error) => {
                if (error) {
                    return res.status(500).json(error.message);
                }
                res.status(200).json(result);
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

module.exports.getBookings = (req, res) => {
    // Page.aggregate([{ $match: { status: { $eq: 'Online' } } },
    // { $lookup: { from: 'accounts', localField: 'creator', foreignField: '_id', as: 'user' } }
    // ]).exec(function (err, pages) {
    const status = req.params.bookingStatus != "Unfinished" ? { $ne: "Unfinished" } : { $eq: "Unfinished" }
    booking.aggregate([
        { $match: { tourist: { $eq: mongoose.Types.ObjectId(req.user._id) }, status: status } },
        { $lookup: { from: 'pages', localField: 'pageId', foreignField: '_id', as: 'page' } },
        { $lookup: { from: 'items', localField: 'selectedServices.service', foreignField: '_id', as: 'services' } }
    ]).exec((error, bookings) => {
        if (error) {
            console.log(error)
            return res.status(500).json(error.message);
        }
        res.status(200).json(bookings);
    })

}

module.exports.viewBooking = (req, res) => {
    booking.findOne({ _id: req.params.bookingId })
        .populate({ path: "pageId", model: "Page" })
        // .populate({path:"pageId", populate: { path: "creator", model: "Account", select: "fullName"}})
        .populate({ path: "selectedServices.service", model: "Item" })
        .populate({ path: "tourist", model: "Account", select: "firstName lastName email contactNumber address fullName" })
        .exec((error, bookings) => {
            if (error) {
                return res.status(500).json(error.message);
            }
            res.status(200).json(bookings);
        })
}

module.exports.deleteBooking = (req, res) => {
    console.log(req.params.bookingId)
    booking.deleteOne({ _id: req.params.bookingId }).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        console.log(error);
        return res.status(500).json(error.message);
    })
}


module.exports.getNotifications = (req, res) => {
    // const condition = req.user.username ? {} : { receiver: req.user._id }
    notificationGroup.find({ receiver: req.user._id })
        .populate({ path: 'notifications', model: 'Notification' })
        .populate({ path: 'page', model: 'Page' })
        .populate({ path: 'mainReceiver', model: 'Account' })
        .populate({ path: 'booking', model: 'Booking' })
        .sort({ 'updatedAt': -1 })
        .exec(async (error, result) => {
            if (error) return res.status(500).json(error.message)
            try {

                res.status(200).json(result);
            } catch (error) {

            }
        })

}

module.exports.viewNotification = (req, res) => {
    notification.updateMany({
        notificationGroup: mongoose.Types.ObjectId(req.params.notificationId)
    }, {
        $set: {
            opened: true
        }
    }, function (err, result) {
        if (err) return res.status(500).json(err.message)
        res.status(200).json(result)
    })
}

module.exports.removeSelectedItem = (req, res) => {
    booking.updateOne(
        {
            _id: req.params.bookingId
        },
        {
            $pull: {
                "selectedServices": { "_id": mongoose.Types.ObjectId(req.params.selectedId) },
            }
        }, function (err, response) {
            if (err) {
                return res.status(500).json({ type: "internal error", error: err.message })
            }
            res.status(200).json(response);
        })
}

function getValue(data, type) {
    return data.map(item => {
        if (item.data.defaultName && item.data.defaultName == type) {
            return item.data.text;
        }
    })
}

module.exports.changeBookingStatus = async (req, res) => {
    try {
        const adminAcc = await adminAccount.find({})
        const admin = adminAcc.length > 0 ? adminAcc[0]: {_id: "605839a8268f4b69047e4bb1"}
        console.log(admin)
        let notif = {
            receiver: req.body.receiver,
            mainReceiver: req.body.mainReceiver,
            page: req.body.page,
            booking: req.body.booking,
            type: req.body.type,
        }
        let notifForAdmin = {
            receiver: admin._id,
            mainReceiver: req.body.mainReceiver,
            page: req.body.page,
            booking: req.body.booking,
            type: "booking-admin",
            message: req.body.messageForAdmin
        }
        if (req.body.type == "booking-provider") {
            notif["message"] = `${req.user.fullName} cancelled ${req.user.gender == 'Male' ? 'his' : 'her'} booking`
            notifForAdmin["message"] = `${req.user.fullName} cancelled ${req.user.gender == 'Male' ? 'his' : 'her'} booking`
        } else if (req.body.type == "booking-tourist") {
            notif["message"] = req.body.message
        }
        if (req.body.updateBookingCount) {
            booking.findById(req.body.booking).then((bookingData, result) => {
                if (bookingData.status == "Booked") {
                    bookingData.selectedServices.forEach(service => {
                        Item.findOne({ _id: mongoose.Types.ObjectId(service.service) }, function (error, doc) {
                            if (req.body.increment) {
                                if (bookingData.isManual) {
                                    doc.manuallyBooked = doc.manuallyBooked + 1;
                                } else {
                                    doc.booked = doc.booked + 1;
                                }
                                let quantity = getValue(doc.data, 'quantity')
                                quantity = quantity.length > 0 ? quantity[0] : 0
                                if (quantity < (doc.manuallyBooked + doc.booked + doc.toBeBooked)) {
                                    const name = getValue(doc.data, 'name')
                                    return res.status(400).json({ type: 'item_availability_issue', message: `${name.length > 0 ? name : 'Untitled Service'} has no more available item!` })
                                } else {
                                    doc.save()
                                }
                            } else {
                                if (bookingData.isManual) {
                                    doc.manuallyBooked = doc.manuallyBooked - 1;
                                } else {
                                    doc.booked = doc.booked - 1;
                                }
                                doc.save()
                            }
                        })
                    })
                }
            })
        }
        await helper.createNotification(notif)
        await helper.createNotification(notifForAdmin)
        booking.updateOne(
            {
                _id: req.body.booking
            },
            {
                $set: {
                    "status": req.params.status
                }
            }, function (err, response) {
                if (err) {
                    return res.status(500).json({ type: "internal error", error: err.message })
                }
                res.status(200).json(response);
            })
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
}


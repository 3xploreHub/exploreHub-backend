const Account = require('../../models/adminSchemas/adminAccount');
const booking = require("../../models/booking");
const Page = require("../../models/page")
const { formatArray, formatComponentArray, formatPendingArray } = require('./func')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs");
const notification = require("../../models/notification");
const { Item } = require("../../models/item");
const mongoose = require("mongoose");

function createToken(user) {
    return jwt.sign({ id: user.id, username: user.username, password: user.password }, "access_token", {
        expiresIn: "12h" // 86400 expires in 24 hours
    })
}
// module.exports.adminAccount = async(req, res) => {
// var userAndPass = {
//     username: "admin",
//     password: "3Xplorehub"
// }
// const salt = await bcrypt.genSalt(10);
// userAndPass.password = await bcrypt.hash(userAndPass.password, salt)
// const user = new Account(userAndPass)
// user.save()
// res.send({
//     status: true,
//     sms: "Saved!!",
//     data: user
// });
// }

module.exports.login = (req, res) => {
    Account.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            const validPassword = bcrypt.compareSync(req.body.password, user.password)
            if (validPassword == false) {
                res.send({ status: false, sms: 'Invalid Credentials' })
            } else {
                return res.send({ status: true, sms: 'Success', token: createToken(user) })
            }
        } else {
            return res.send({ status: false, sms: 'Account doesn\'t exist' });
        }
    })
}

module.exports.pusher = (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
}

module.exports.getAllBookings = (req, res) => {
    booking.find({ status: req.params.bookingStatus })
        .populate({ path: "tourist", model: "Account", select: "fullName address contactNumber email" })
        .populate({ path: "pageId", populate: { path: "creator", model: "Account" } })
        .populate({ path: "selectedServices.service", model: "Item" })
        .sort({ 'updatedAt': -1 })
        .exec((error, bookings) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                // start get booking Info
                let result = []; // initialize result
                if (bookings.length) {
                    // format object algorithm
                    bookings.forEach(bookingDetail => {
                        let formattedObject = {...bookingDetail._doc }; //deep copy
                        let { bookingInfo } = formattedObject; //object destructuring
                        if (bookingInfo && bookingInfo.length) { //bookingInfo != null , bookingInfo!=  && bookingInfo [*,*,*]
                            //loop through booking info array
                            let simplifiedDetail = bookingInfo.map((info) => {
                                //loop every object
                                let { inputLabel, value } = info._doc;
                                if (value && typeof value == 'object') {
                                    let objectKeys = Object.keys(value) //Object.keys return all the keys of the object as a string array , not sure sa nested
                                    if (objectKeys.includes('month')) {
                                        let { month, day, year } = value;
                                        let date = `${month.text} ${day.text},${year.text}`
                                        value = date;
                                    }
                                }
                                return { label: inputLabel, value }
                            });
                            formattedObject.bookingInfo = simplifiedDetail;
                        }
                        let components = formatComponentArray(formattedObject.pageId._doc.components);

                        if (components != undefined) formattedObject.pageId._doc.components = components; //get page Default vale
                        formattedObject.selectedServiceData = formattedObject.selectedServices
                        formattedObject.selectedServices = formatArray(formattedObject.selectedServices)

                        result.push(formattedObject)
                    });
                }

                res.status(200).json(result);
            }
        })
}

module.exports.getAllPendingNotifications = (req, res) => {
    Page.find({ status: req.params.pageStatus })
        .populate({ path: "hostTouristSpot", model: "Page" })
        .populate({ path: "creator", model: "Account", select: "fullName" })
        .populate({ path: "services.data", model: "Item" })
        .exec((err, pages) => {

            if (err) {
                res.status(500).json({ error: err })
            }
            if (pages.length) {
                pages.forEach((page, idx) => {
                    page._doc.components = formatComponentArray(page._doc.components) //onlycomponents property 
                    let services = page.services;

                    if (!services || !services.length) {
                        return
                    }
                    page._doc.services = formatPendingArray(services)
                });
            }

            res.status(200).json(pages)
        })
}

module.exports.setBookingStatus = async(req, res) => {
    const notifForProvider = new notification({
        receiver: req.body.serviceProviderReceiver,
        booking: req.body.bookingId,
        type: "page-booking",
        message: req.body.messageForServiceProvider
    })

    const notifForTourist = new notification({
        receiver: req.body.touristReceiver,
        booking: req.body.bookingId,
        type: "booking",
        message: req.body.messageForTourist
    })

    if (req.body.servicesToUpdate) {
        req.body.servicesToUpdate.forEach(service => {
            Item.updateOne({
                _id: mongoose.Types.ObjectId(service._id)
            }, {
                $set: service.bookingData
            }, function(error, result) {
                if (error) {
                    return res.status(500).json(error);
                }
            })
        })
    }
    booking.findByIdAndUpdate({ _id: req.body.bookingId }, { $set: { status: req.body.status } }, { new: true })
        .populate({ path: "tourist", model: "Account", select: "firstName lastName address" })
        .exec(async(err, data) => {
            if (err) {
                res.status(500).json({ error: err })
            }
            try {

                const result = await notifForProvider.save()
                const result2 = await notifForTourist.save()
                return res.status(200).json({ data: data, result: result, result2: result2 })
            } catch (error) {
                res.status(500).json(error)
            }
        })
}


module.exports.setPageStatus = async(req, res) => {
        const notif = new notification({
            receiver: req.body.pageCreator,
            page: req.body.pageId,
            type: "page",
            message: req.body.message,
        })
        Page.findByIdAndUpdate({ _id: req.body.pageId }, { $set: { status: req.body.status } }, { new: true }, (err, page) => {
            if (err) {
                return res.status(500).json({ error: err })
            }
            notif.save().then((result) => {
                return res.status(200).json({ page: page, result: result })
            }).catch(error => {
                res.status(500).json(error)
            })
        })
    }
    // module.exports.getOnlinePage = (req, res) => {
    //     Page.findByIdAndUpdate({ _id: req.params.pageId }, { $set: { status: "Online" } }, { new: true }, (err, page) => {
    //         if (err) {
    //             res.status(500).json({ error: err })
    //         }
    //         //console.log(page);
    //         res.status(200).json(page)
    //     })
    // }
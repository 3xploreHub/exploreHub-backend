const express = require("express");
const router = express();
const admin = require('../../controllers/adminController/admin')
router.post('/login', admin.login);
router.post('/auth', admin.pusher);
router.get('/getAllBookings/:bookingStatus', admin.getAllBookings);
router.get('/getAllPendingNotifications/:pageStatus', admin.getAllPendingNotifications);

// router.get('/getOnProcessBooking/:bookingId', admin.getOnProcessBooking)
// router.get("/getBookedDetails/:bookingId", admin.getBookedDetails)
// router.get("/getDeclineBookings/:bookingId", admin.getDeclinedBookings)
// router.get("/getPendingBookings/:bookingId", admin.getPendingBookings)
router.post("/setPageStatus", admin.setPageStatus)
router.post("/setBookingStatus", admin.setBookingStatus)

// router.get("/getOnlinePage/:pageId", admin.getOnlinePage)

module.exports = router;
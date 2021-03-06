const express = require("express");
const router = express.Router();
const serviceProviderRoutes = require("./routeGroups/serviceProviderRoutes");
const accountRoutes = require("./routeGroups/accountRoutes");
const checkIfAuthorized = require("../middlewares/checkIfAuthorized");

router.use("/account", accountRoutes);
router.use("/service-provider", checkIfAuthorized, serviceProviderRoutes);

module.exports = router;

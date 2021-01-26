const express = require("express");
const router = express.Router();
const touristSpotOperatorRoutes = require("./routeGroups/touristSpotOperatorRoutes");
const accountRoutes = require("./routeGroups/accountRoutes");
const checkIfAuthorized = require("../middlewares/checkIfAuthorized");

router.use("/account", accountRoutes);
router.use(
  "/touristSpotOperator",
  checkIfAuthorized,
  touristSpotOperatorRoutes
);

module.exports = router;

const express = require("express");
const router = express.Router();
const getUserInformation = require("../../controllers/accountController/getUserInformations");
const login = require("../../controllers/accountController/login");
const registrationFunctions = require("../../controllers/accountController/registrationFunctions");
const accountFinder = require("../../controllers/accountController/accountFinderFunctions");
const requestCode = require("../../controllers/accountController/requestCode");
const verification = require("../../controllers/accountController/verificationCodeFunctions");
const checkIfAuthorized = require("../../middlewares/checkIfAuthorized");
const changePassword = require("../../controllers/accountController/changePassword");

router.post("/login", login);
router.post("/initialRegistration", registrationFunctions.initialRegistration);
router.post(
  "/addAccountInformation",
  checkIfAuthorized,
  registrationFunctions.addAccountInformation
);

router.get("/getUserInformation", checkIfAuthorized, getUserInformation);
router.post(
  "/checkEmailOrNumberAvailability",
  registrationFunctions.checkEmailOrNumberAvailability
);
router.post("/findAccount", accountFinder.findAccount);
router.post(
  "/findAccountById",
  verification.getCodeExp,
  accountFinder.findAccountById
);
router.post("/requestCode", requestCode, verification.handleCode);
router.post("/submitCode", verification.checkCode);
router.post("/changePassword", checkIfAuthorized, changePassword);
router.post(
  "/deleteAccount",
  checkIfAuthorized,
  registrationFunctions.deleteAccount
);

module.exports = router;

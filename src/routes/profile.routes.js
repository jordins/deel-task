const express = require("express");
const router = express.Router();

const {
  depositMoney
} = require("../controller/profile.controller");
const { getProfile } = require("../middleware/getProfile");


// NOTE: I'm assuming that the userId doesn't need to be the authenticated user
router.post("/deposit/:userId", getProfile, depositMoney);

module.exports = { router };

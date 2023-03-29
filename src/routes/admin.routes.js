const express = require("express");
const router = express.Router();
const {
  getBestProfession,
  getBestClients,
} = require("../controller/admin.controller");
const { getProfile } = require("../middleware/getProfile");

// I'm assuming we have some sort of authentication for admin, at the moment just kept the "getProfile"
router.get("/best-profession", getProfile, getBestProfession);
router.get("/best-clients", getProfile, getBestClients);

module.exports = { router };

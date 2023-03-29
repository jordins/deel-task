const express = require("express");
const router = express.Router();

const {
  getContractById,
  listNonTerminatedContracts,
} = require("../controller/contract.controller");
const { getProfile } = require("../middleware/getProfile");

router.get("/:id", getProfile, getContractById);
router.get("/", getProfile, listNonTerminatedContracts);

module.exports = { router };

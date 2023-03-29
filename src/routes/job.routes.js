const express = require("express");
const router = express.Router();

const {
  listUnpaidJobs,
  payJob,
} = require("../controller/job.controller");
const { getProfile } = require("../middleware/getProfile");

router.get("/unpaid", getProfile, listUnpaidJobs);
router.post("/:job_id/pay", getProfile, payJob);

module.exports = { router };

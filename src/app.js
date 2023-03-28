const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const { Op } = require("sequelize");
const { listUnpaidJobs, payJob } = require("./service/job.service");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/**
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: {
      [Op.and]: [
        { id },
        {
          [Op.or]: [
            { ContractorId: req.profile.id },
            { ClientId: req.profile.id },
          ],
        },
      ],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

/**
 * @returns a list of non-terminated contracts belonging to a user (client or contractor)
 */
app.get("/contracts", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const contracts = await Contract.findAll({
    where: {
      [Op.and]: [
        { status: { [Op.ne]: "terminated" } },
        {
          [Op.or]: [
            { ContractorId: req.profile.id },
            { ClientId: req.profile.id },
          ],
        },
      ],
    },
  });
  if (!contracts || contracts.length === 0) return res.status(404).end();
  res.json(contracts);
});

/**
 * Get all unpaid jobs for a user (either a client or contractor), for active contracts only
 * @returns a list of unpaid jobs belonging to a client or contractor
 */
app.get("/jobs/unpaid", getProfile, async (req, res) => {
  const unpaidJobsResult = await listUnpaidJobs(req.profile);
  if (unpaidJobsResult.type === "JOBS_NOT_FOUND") {
    console.log(unpaidJobsResult.message);
    return res.status(404).end();
  }
  res.json(unpaidJobsResult.data);
});

/**
 * Pay for a job from client to contractor
 */
app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  const jobId = req.params.job_id;

  try {
    const result = await payJob(jobId, req.profile);
    console.log(result.message);
    if (result.type === "JOB_NOT_FOUND") {
      return res.status(404).end();
    }
    if (result.type === "NOT_ENOUGH_FUNDS") {
      return res.status(400).end();
    }
    if (result.type === "PAYMENT_DONE") {
      return res.status(204).end();
    }
    if (result.type === "PAYMENT_FAILED") {
      return res.status(500).end();
    }
  } catch (error) {
    console.error(`ERROR ${error}`);
    return res.status(500).end();
  }
});

module.exports = app;

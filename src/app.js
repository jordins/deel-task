const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const { Op } = require("sequelize");
const { listUnpaidJobs, payJob } = require("./service/job.service");
const { getBestProfession } = require("./service/admin.service");
const { depositMoney } = require("./service/profile.service");
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
    return res.status(404).json({
      error: unpaidJobsResult.message,
    });
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
      return res.status(404).json({
        error: result.message,
      });
    }
    if (result.type === "NOT_ENOUGH_FUNDS") {
      return res.status(400).json({
        error: result.message,
      });
    }
    if (result.type === "PAYMENT_DONE") {
      return res.status(204).json({
        error: result.message,
      });
    }
    if (result.type === "PAYMENT_FAILED") {
      return res.status(500).json({
        error: result.message,
      });
    }
  } catch (error) {
    console.error(`ERROR ${error}`);
    return res.status(500).json({ error });
  }
});

app.post("/balances/deposit/:userId", getProfile, async (req, res) => {
  // NOTE: I'm assuming that the userId doesn't need to be the authenticated user
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({
      error: `Can't deposit without userId`,
    });
  }
  const amount = req.body.amount;
  if (!amount) {
    return res.status(400).json({
      error: `Can't deposit to userId=${userId} without amount`,
    });
  }

  const result = await depositMoney(userId, amount, req.profile.id);
  console.log(result.message);
  if (result.type === "INVALID_AMOUNT") {
    return res.status(400).json({
      error: result.message,
    });
  }
  if (result.type === "CLIENT_NOT_FOUND") {
    return res.status(404).json({
      error: result.message,
    });
  }
  if (result.type === "DEPOSIT_DONE") {
    return res.status(204).end();
  }
});

app.get("/admin/best-profession", getProfile, async (req, res) => {
  if (!req.query.start || !req.query.end) {
    return res.status(400).json({
      error: `missing params`,
    });
  }
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  //TODO: if start > end -> 400
  const result = await getBestProfession(start, end);
  if (result.type === "PROFESSIONS_NOT_FOUND") {
    return res.status(404).json({
      error: result.message,
    });
  }
  return res.status(200).json(result.data);
});

module.exports = app;

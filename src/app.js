const express = require("express");
const bodyParser = require("body-parser");
const { sequelize, Job } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const { Op } = require("sequelize");
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
  const { Contract } = req.app.get("models");
  const contracts = await Contract.findAll({
    where: {
      [Op.and]: [
        { status: { [Op.eq]: "in_progress" } },
        {
          [Op.or]: [
            { ContractorId: req.profile.id },
            { ClientId: req.profile.id },
          ],
        },
      ],
    },
    include: {
      model: Job,
      required: true,
      where: {
        paid: {
          [Op.not]: true,
        },
      },
      attributes: { exclude: [] },
    },
    attributes: [],
  });
  if (!contracts || contracts.length === 0) return res.status(404).end();
  const unpaidJobs = [];
  contracts.forEach((c) => {
    unpaidJobs.push(...c.Jobs);
  });
  res.json(unpaidJobs);
});

module.exports = app;

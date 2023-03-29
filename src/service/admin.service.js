const { sequelize, Job, Contract, Profile } = require("../model");
const { Op } = require("sequelize");
const { Result } = require("./result");

const getBestProfession = async (startDate, endDate) => {
  const bestProfession = await Job.findAll({
    where: {
      paid: true,
      paymentDate: { [Op.between]: [startDate, endDate] },
    },
    include: {
      model: Contract,
      required: true,
      include: {
        model: Profile,
        as: "Contractor",
        required: true,
        attributes: ["profession"],
        where: { type: "contractor" },
      },
    },
    attributes: [[sequelize.fn("SUM", sequelize.col("price")), "pricesum"]],
    group: ["profession"],
    order: [["pricesum", "DESC"]],
    limit: 1,
  });

  if (!bestProfession || !bestProfession.length) {
    return new Result(
      "PROFESSIONS_NOT_FOUND",
      `Professions not found, empty data`
    );
  }
  return new Result(
    "BEST_PROFESSION_FOUND",
    ``,
    bestProfession[0]?.Contract.Contractor.profession
  );
};

const getBestClients = async (startDate, endDate, limit = 2) => {
  const bestClientsQuery = await Job.findAll({
    where: {
      paid: true,
      paymentDate: { [Op.between]: [startDate, endDate] },
    },
    attributes: [
      "id",
      [sequelize.fn("SUM", sequelize.col("price")), "paid"],
      [sequelize.col("Contract.Client.firstName"), "firstName"],
      [sequelize.col("Contract.Client.lastName"), "lastName"],
    ],
    order: [[sequelize.fn("SUM", sequelize.col("price")), "DESC"]],
    group: ["Contract.Client.id"],
    limit: limit,
    include: {
      model: Contract,
      required: true,
      attributes: [],
      include: {
        model: Profile,
        as: "Client",
        required: true,
        where: { type: "client" },
        attributes: ["id", "firstName", "lastName"],
      },
    },
  });
  const bestClients = bestClientsQuery.map((c) => ({
    id: c.id,
    fullName: c.firstName + c.lastName,
    paid: c.paid,
  }));

  if (!bestClients || !bestClients.length) {
    return new Result("CLIENTS_NOT_FOUND", `Clients not found, empty data`);
  }
  return new Result("BEST_CLIENTS_FOUND", ``, bestClients);
};

module.exports = {
  getBestProfession,
  getBestClients,
};

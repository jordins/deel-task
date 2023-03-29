const { Op } = require("sequelize");

/**
 * @returns contract by id
 */
const getContractById = async (req, res) => {
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
};

/**
 * @returns a list of non-terminated contracts belonging to a user (client or contractor)
 */
const listNonTerminatedContracts = async (req, res) => {
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
};

module.exports = {
  getContractById,
  listNonTerminatedContracts,
};

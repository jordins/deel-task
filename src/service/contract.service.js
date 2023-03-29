const { Contract } = require("../model");
const { Op } = require("sequelize");
const { Result } = require("./result");

const getContractById = async (id, profile) => {
  const contract = await Contract.findOne({
    where: {
      [Op.and]: [
        { id },
        {
          [Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
        },
      ],
    },
  });
  if (!contract) {
    return new Result("CONTRACT_NOT_FOUND", `Contract with id=${id} not found`);
  }

  return new Result("CONTRACT_FOUND", `Contract with id=${id} found`, contract);
};
const listNonTerminatedContracts = async (profile) => {
  const contracts = await Contract.findAll({
    where: {
      [Op.and]: [
        { status: { [Op.ne]: "terminated" } },
        {
          [Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
        },
      ],
    },
  });
  if (!contracts || contracts.length === 0) {
    return new Result("UNTERMINATED_CONTRACTS_NOT_FOUND", `Unterminated contracts for profile with id=${profile.id} not found`);
  }

  return new Result("UNTERMINATED_CONTRACTS_FOUND", `Unterminated contracts for profile with id=${profile.id} found`, contracts);
};

module.exports = {
  getContractById,
  listNonTerminatedContracts,
};

const {
  getContractById: getContractByIdService,
  listNonTerminatedContracts: listNonTerminatedContractsService,
} = require("../service/contract.service");

/**
 * @returns contract by id
 */
const getContractById = async (req, res) => {
  const { id } = req.params;
  const result = await getContractByIdService(id, req.profile);
  if (result.type === "CONTRACT_NOT_FOUND") {
    return res.status(404).json({
      error: result.message,
    });
  }
  return res.status(200).json(result.data);
};

/**
 * @returns a list of non-terminated contracts belonging to a user (client or contractor)
 */
const listNonTerminatedContracts = async (req, res) => {
  const result = await listNonTerminatedContractsService(req.profile);
  if (result.type === "UNTERMINATED_CONTRACTS_NOT_FOUND") {
    return res.status(404).json({
      error: result.message,
    });
  }
  return res.status(200).json(result.data);
};

module.exports = {
  getContractById,
  listNonTerminatedContracts,
};

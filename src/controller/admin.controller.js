const {
  getBestProfession: getBestProfessionService,
  getBestClients: getBestClientsService,
} = require("../service/admin.service");

const getBestProfession = async (req, res) => {
  if (!req.query.start || !req.query.end) {
    return res.status(400).json({
      error: `missing params`,
    });
  }
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  // TODO: if start > end -> 400
  const result = await getBestProfessionService(start, end);
  if (result.type === "PROFESSIONS_NOT_FOUND") {
    return res.status(404).json({
      error: result.message,
    });
  }
  return res.status(200).json(result.data);
};

const getBestClients = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 2;
  if (!req.query.start || !req.query.end) {
    return res.status(400).json({
      error: `missing params`,
    });
  }
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  // TODO: if start > end -> 400
  const result = await getBestClientsService(start, end, limit);
  if (result.type === "CLIENTS_NOT_FOUND") {
    return res.status(404).json({
      error: result.message,
    });
  }
  return res.status(200).json(result.data);
};

module.exports = {
  getBestProfession,
  getBestClients,
};

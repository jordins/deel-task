const {
  depositMoney: depositMoneyService,
} = require("../service/profile.service");

const depositMoney = async (req, res) => {
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

  const result = await depositMoneyService(userId, amount, req.profile.id);
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
};

module.exports = {
  depositMoney,
};

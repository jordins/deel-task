const { sequelize, Job, Contract, Profile } = require("../model");
const { Op } = require("sequelize");
const { Result } = require("./result");

const depositMoney = async (receiverId, amountToDeposit, senderId) => {
  const transaction = await sequelize.transaction();

  try {
    const totalAmountInJobsToPay = await Job.sum(
      "price",
      {
        where: {
          paid: {
            [Op.not]: true,
          },
        },
        include: {
          model: Contract,
          where: { status: "in_progress", clientId: senderId },
          required: true,
          attributes: [],
        },
      },
      { transaction }
    );

    if (amountToDeposit > totalAmountInJobsToPay * 0.25) {
      return new Result(
        "INVALID_AMOUNT",
        `Can't deposit more than 25% of total jobs to pay`
      );
    }

    const client = await Profile.findOne({ id: receiverId }, { transaction });
    if (!client) {
      return new Result(
        "CLIENT_NOT_FOUND",
        `Client with id=${receiverId} not found`
      );
    }
    await client.increment({ balance: amountToDeposit }, { transaction });
    // I'm assuming that we don't need to decrement the balance of the sender (otherwise we would need to decrement the sender balance)
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
  }
  return new Result(
    "DEPOSIT_DONE",
    `Deposit done to clientId=${receiverId} with amount=${amountToDeposit}`
  );
};

module.exports = {
  depositMoney,
};

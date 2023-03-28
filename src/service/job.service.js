const { sequelize, Job, Contract, Profile } = require("../model");
const { Op } = require("sequelize");
const { Result } = require("./result");

const payJob = async (jobId, profile) => {
  const clientId = profile.id;
  const job = await Job.findOne({
    where: {
      id: jobId,
      paid: {
        [Op.not]: true,
      },
    },
    include: {
      model: Contract,
      where: {
        ClientId: clientId,
        status: "in_progress",
      },
      // TODO: select only required fields from contract
    },
  });

  if (!job) {
    return new Result(
      "JOB_NOT_FOUND",
      `No job to pay found with jobId=${jobId}`
    );
  }
  if (profile.balance < job.price) {
    return new Result(
      "NOT_ENOUGH_FUNDS",
      `Not enough funds to pay the job with jobId=${jobId}`
    );
  }
  const t = await sequelize.transaction();

  try {
    const jobPromise = Job.update(
      { paid: true, paymentDate: new Date() },
      { where: { id: jobId } },
      { transaction: t }
    );

    const clientPromise = Profile.update(
      { balance: profile.balance - job.price },
      { where: { id: clientId } },
      { transaction: t }
    );

    const contractorPromise = Profile.update(
      { balance: sequelize.col("balance") + job.price },
      { where: { id: job.Contract.ContractorId } },
      { transaction: t }
    );
    await Promise.all([jobPromise, clientPromise, contractorPromise]);
    await t.commit();
    // Payment done
    return new Result("PAYMENT_DONE", `Job with jobId=${jobId} paid`);
  } catch (error) {
    console.error(`Error paying job with jobId=${jobId}: ${error}`);
    await t.rollback();
    return new Result("PAYMENT_FAILED", `Payment failed for jobId=${jobId}`);
  }
};

module.exports = {
  payJob: payJob,
};

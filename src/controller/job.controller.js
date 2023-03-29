const {
  listUnpaidJobs: listUnpaidJobsService,
  payJob: payJobService,
} = require("../service/job.service");

/**
 * Get all unpaid jobs for a user (either a client or contractor), for active contracts only
 * @returns a list of unpaid jobs belonging to a client or contractor
 */
const listUnpaidJobs = async (req, res) => {
  const unpaidJobsResult = await listUnpaidJobsService(req.profile);
  if (unpaidJobsResult.type === "JOBS_NOT_FOUND") {
    console.log(unpaidJobsResult.message);
    return res.status(404).json({
      error: unpaidJobsResult.message,
    });
  }
  res.json(unpaidJobsResult.data);
};

/**
 * Pay for a job from client to contractor
 */
const payJob = async (req, res) => {
  const jobId = req.params.job_id;

  try {
    const result = await payJobService(jobId, req.profile);
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
};

module.exports = {
  listUnpaidJobs,
  payJob,
};

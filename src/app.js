const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { router: contractApi } = require("./routes/contract.routes");
const { router: jobApi } = require("./routes/job.routes");
const { router: profileApi } = require("./routes/profile.routes");
const { router: adminApi } = require("./routes/admin.routes");

const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

app.use("/contracts", contractApi);
app.use("/jobs", jobApi);
app.use("/balances", profileApi);
app.use("/admin", adminApi);

module.exports = app;

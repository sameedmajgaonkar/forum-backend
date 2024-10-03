require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const logger = require("./logger");
const users = require("./routes/users");
const logins = require("./routes/logins");
const questions = require("./routes/questions");

mongoose.connect("mongodb://localhost:27017/forum").then(() => {
  logger.info("Connected to forums backend");
});

app.use(express.json());
app.use("/api/users", users);
app.use("/api/logins", logins);
app.use("/api/questions", questions);

const PORT = process.env.PORT || 3000;

console.log(process.env.FORUM_JWT_SECRET);
app.listen(PORT, () => logger.info(`Listening on PORT ${PORT}`));

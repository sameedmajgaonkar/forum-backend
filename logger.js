const winston = require("winston");

const consoleTransport = new winston.transports.Console({
  level: "silly",
  handleExceptions: true,
  handleRejections: true,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY MM DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `[ ${info.timestamp} ] ${info.level} : ${info.message}`
    )
  ),
});

const logger = winston.createLogger({
  transports: [consoleTransport],
});

module.exports = logger;

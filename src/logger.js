const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

// custom format definition
const customFormat = printf(info => {
  return `${info.timestamp} [${info.level}]: ${info.message}`;
});

// setup logger
const logger = createLogger({
  format: combine(timestamp(), customFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/combined.log" })
  ]
});

// simple log helper method
const log = message => {
  logger.log({ level: "info", message });
};

module.exports = {
  log
};

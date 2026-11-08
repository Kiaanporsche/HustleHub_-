
/*
 * Structured application logging for HustleHub+.
 * Records security events, application events and errors.
 */

const winston = require("winston");
const LokiTransport = require("winston-loki");
const path = require("path");
const fs = require("fs");

// Store logs inside the backend directory.
const logDirectory = path.join(__dirname, "../logs");

fs.mkdirSync(logDirectory, { recursive: true });

// Include timestamps and consistent JSON formatting.
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    defaultMeta: {
        service: "hustlehub-backend"
    },
    transports: [
        // Record all info, warning and error events.
        new winston.transports.File({
            filename: path.join(logDirectory, "combined.log"),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5
        }),

        // Maintain a separate error log.
        new winston.transports.File({
            filename: path.join(logDirectory, "error.log"),
            level: "error",
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5
        }),

        // Display events in the backend terminal.
        new winston.transports.Console()
    ]
});



// Code Attribution:
// Title: winston-loki
// Author: winston-loki Contributors
// Date Accessed: 7 November 2026
// Version: See installed package version
// Availability: https://www.npmjs.com/package/winston-loki
// Purpose: Referenced for integrating structured
// Winston application logs with Grafana Cloud Loki.


// GRAFANA CLOUD LOKI LOGGING
const lokiHost = process.env.LOKI_HOST;
const lokiUsername = process.env.LOKI_USERNAME;
const lokiPassword = process.env.LOKI_PASSWORD;

if (lokiHost && lokiUsername && lokiPassword) {

    logger.add(
        new LokiTransport({
            host: lokiHost,

            basicAuth: `${lokiUsername}:${lokiPassword}`,

            labels: {
                app: process.env.APP_NAME || "HustleHubAPI",
                environment: process.env.NODE_ENV || "development"
            },

            json: true,
            replaceTimestamp: true,

            onConnectionError: (error) => {
                console.error(
                    "Loki connection error:",
                    error.message
                );
            }
        })
    );

    logger.info("monitor.cloud_logging_configured");

} else {

    logger.warn("monitor.cloud_logging_not_configured");

}

module.exports = logger;



// Code Attribution:
// Title: Winston Logging Library
// Author: Winston Contributors
// Date Accessed: 7 November 2026
// Version: Check installed version using npm list winston
// Availability: https://github.com/winstonjs/winston
// Purpose: Referenced for implementing structured
// application logging, including timestamps,
// severity levels, file-based logging, and
// error monitoring in the HustleHub+ backend.



/*
    // Code Attribution:
    // Title: Express Error Handling
    // Author: Express.js Team
    // Date Accessed: 7 November 2026
    // Version: Express 5
    // Availability: https://expressjs.com/en/guide/error-handling.html
    // Purpose: Referenced for implementing centralized
    // error handling with controlled API responses
    // and structured Winston error logging.
*/

const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {

    // Hand off errors if the response has already started.
    if (res.headersSent) {
        return next(err);
    }

    // Handle malformed JSON requests.
    if (err.type === "entity.parse.failed") {

        logger.warn("request.invalid_json", {
            method: req.method,
            path: req.path,
            statusCode: 400
        });

        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body."
        });
    }

    // Determine the HTTP status code.
    const statusCode =
        err.status >= 400 && err.status < 500
            ? err.status
            : 500;

    const logDetails = {
        method: req.method,
        path: req.path,
        statusCode,
        errorType: err.name || "Error"
    };

    // Log unexpected server errors.
    if (statusCode >= 500) {
        logger.error("application.server_error", logDetails);
    } else {
        logger.warn("application.request_error", logDetails);
    }

    // Return a safe response without internal details.
    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "An internal server error occurred."
            : "Request could not be processed."
    });
};

module.exports = errorMiddleware;

const { rateLimit } = require("express-rate-limit");

// Enable higher limits only for local automated testing
const isTestMode =
    process.env.NODE_ENV === "development" &&
    process.env.HUSTLEHUB_TEST_MODE === "true";

// Limit authentication requests to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    // Normal: 10 requests | Automated testing: 100 requests
    limit: isTestMode ? 100 : 10,

    standardHeaders: "draft-7",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many authentication requests. Please try again later."
    }
});

// Limit booking requests
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    // Normal: 5 requests | Automated testing: 50 requests
    limit: isTestMode ? 50 : 5,

    standardHeaders: "draft-7",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many booking requests. Please try again later."
    }
});

module.exports = {
    authLimiter,
    bookingLimiter
};
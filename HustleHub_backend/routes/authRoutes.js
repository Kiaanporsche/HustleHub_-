const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/authController");

const {
    registerValidation,
    loginValidation,
    handleValidationErrors
} = require("../middleware/validationMiddleware");

const { authLimiter } = require("../middleware/rateLimitMiddleware");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/auth/register
router.post(
    "/register",
    authLimiter,
    registerValidation,
    handleValidationErrors,
    registerUser
);

router.post(
    "/login",
    authLimiter,
    loginValidation,
    handleValidationErrors,
    loginUser
);

// SECURE LOGOUT ROUTE

// POST /api/auth/logout
// Requires a valid, non-revoked JWT.
router.post(
    "/logout",
    authenticateToken,
    logoutUser
);


module.exports = router;
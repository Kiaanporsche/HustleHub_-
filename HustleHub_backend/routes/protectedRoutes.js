/*
    // Code Attribution:
    // Title: Express Routing
    // Author: Express.js Team
    // Date Accessed: 12 October 2026
    // Version: Check installed Express version in package.json
    // Availability: https://expressjs.com/en/guide/routing.html
    // Purpose: Referenced for defining protected endpoints
    // that use middleware to control access to resources.
*/

const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /api/protected/profile
router.get("/profile", authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You have accessed a protected route.",
        user: req.user
    });
});

router.get(
    "/freelancer-test",
    authenticateToken,
    authorizeRoles("freelancer"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Freelancer access granted.",
            user: req.user
        });
    }
);
module.exports = router;
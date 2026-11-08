/*
 * Code attribution:
 * Title: Express Routing
 * Source: Express.js
 * Available at: https://expressjs.com/en/guide/routing.html
 * Accessed: 12 October 2026
 * Relevance: Reference for defining transaction endpoints
 * and mapping requests to route handlers.
 */

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {getClientTransactions,getFreelancerTransactions,getFreelancerIncomeTotal } = require("../controllers/transactionController");
    


router.get(
    "/client",
    authenticateToken,
    authorizeRoles("client"),
    getClientTransactions
);

router.get(
    "/freelancer",
    authenticateToken,
    authorizeRoles("freelancer"),
    getFreelancerTransactions
);

router.get(
    "/freelancer/income",
    authenticateToken,
    authorizeRoles("freelancer"),
    getFreelancerIncomeTotal
);

module.exports = router;
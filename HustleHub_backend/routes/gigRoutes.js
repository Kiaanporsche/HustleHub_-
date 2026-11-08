/*
 * Code attribution:
 * Title: Express Routing
 * Source: Express.js
 * Available at: https://expressjs.com/en/guide/routing.html
 * Accessed: 12 October 2026
 * Relevance: Reference for defining HTTP routes and
 * connecting requests to controller functions.
 */

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createGig, getAllGigs, getMyGigs, getGig, editGig, removeGig} = require("../controllers/gigController");
const {gigValidation,handleValidationErrors} = require("../middleware/validationMiddleware");

router.post(
    "/",
    authenticateToken,
    authorizeRoles("freelancer"),
    gigValidation,
    handleValidationErrors,
    createGig
       
);

router.get(
    "/",
    getAllGigs
);

router.get(
    "/mine",
    authenticateToken,
    authorizeRoles("freelancer"),
    getMyGigs
);

router.get(
    "/:id",
    getGig
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("freelancer"),
    gigValidation,
    handleValidationErrors,
    editGig
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("freelancer"),
    removeGig
);


module.exports = router;
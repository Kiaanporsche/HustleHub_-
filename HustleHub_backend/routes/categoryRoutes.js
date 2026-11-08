
/*
 * Code attribution:
 * Title: Express Routing
 * Source: Express.js
 * Available at: https://expressjs.com/en/guide/routing.html
 * Accessed: 28 October 2026
 * Relevance: Reference for defining category API routes
 * and connecting requests to controller functions.
 */

const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    getAllCategories,
    createCategory
} = require("../controllers/categoryController");

const {
    handleValidationErrors
} = require("../middleware/validationMiddleware");

// Validate category names before saving them.
const categoryValidation = [
    body("name")
        .isString()
        .withMessage("Category name must be text.")
        .bail()
        .trim()
        .customSanitizer((value) =>
            value.replace(/\s+/g, " ")
        )
        .notEmpty()
        .withMessage("Category name is required.")
        .isLength({ min: 2, max: 50 })
        .withMessage(
            "Category name must be between 2 and 50 characters."
        )
        .matches(/^[\p{L}\p{N} &'/-]+$/u)
        .withMessage(
            "Category name contains invalid characters."
        )
];

// Retrieve all categories.
// Public access allows clients and freelancers to browse them.
router.get(
    "/",
    getAllCategories
);

// Add a new category.
// Only authenticated freelancers are allowed.
router.post(
    "/",
    authenticateToken,
    authorizeRoles("freelancer"),
    categoryValidation,
    handleValidationErrors,
    createCategory
);

module.exports = router;


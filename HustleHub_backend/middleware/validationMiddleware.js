/*
 * Code attribution:
 * Title: express-validator Documentation
 * Source: express-validator
 * Available at: https://express-validator.github.io/docs/
 * Accessed: 12 October 2026
 * Relevance: Reference for validating and sanitising
 * incoming request data in Express applications.
 */
const { body, validationResult } = require("express-validator");

const registerValidation = [
    body("name")
    .exists({ values: "falsy" })
    .withMessage("Name is required.")
    .bail()
    .isString()
    .withMessage("Name must be text.")
    .bail()
    .trim()
    .customSanitizer((value) =>
        value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    )
    .notEmpty()
    .withMessage("Name is required.")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters.")
    .matches(/^[\p{L}\p{M} .'\u2019-]+$/u)
    .withMessage("Name contains invalid characters."),

    body("email")
    .exists({ values: "null" })
    .withMessage("Email is required.")
    .bail()
    .isString()
    .withMessage("Email must be text.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isLength({ max: 254 })
    .withMessage("Email is too long.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .bail()
    .normalizeEmail(),

    body("password")
    .exists({ values: "null" })
    .withMessage("Password is required.")
    .bail()
    .isString()
    .withMessage("Password must be text.")
    .bail()
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters.")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .bail()
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),

    body("role")
        .optional()
        .isIn(["client", "freelancer"])
        .withMessage("Role must be either client or freelancer.")
];


const loginValidation = [
    body("email")
    .exists({ values: "null" })
    .withMessage("Email is required.")
    .bail()
    .isString()
    .withMessage("Email must be text.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isLength({ max: 254 })
    .withMessage("Email is too long.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .bail()
    .normalizeEmail(),

    body("password")
    .exists({ values: "null" })
    .withMessage("Password is required.")
    .bail()
    .isString()
    .withMessage("Password must be text.")
    .bail()
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ max: 128 })
    .withMessage("Password is too long."),
];

// Validates gig details when creating or editing a gig
const gigValidation = [
    body("title")
        .exists({ values: "null" })
        .withMessage("Gig title is required.")
        .bail()
        .isString()
        .withMessage("Gig title must be text.")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Gig title is required.")
        .bail()
        .isLength({ min: 3, max: 100 })
        .withMessage("Gig title must be between 3 and 100 characters.")
        .bail()
        .not()
        .matches(/[<>]/)
        .withMessage("Gig title cannot contain HTML markup."),

    body("description")
        .exists({ values: "null" })
        .withMessage("Description is required.")
        .bail()
        .isString()
        .withMessage("Description must be text.")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Description is required.")
        .bail()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters.")
        .bail()
        .not()
        .matches(/[<>]/)
        .withMessage("Description cannot contain HTML markup."),

    body("category")
        .exists({ values: "null" })
        .withMessage("Category is required.")
        .bail()
        .isString()
        .withMessage("Category must be text.")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Category is required.")
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage("Category must be between 2 and 50 characters.")
        .bail()
        .not()
        .matches(/[<>]/)
        .withMessage("Category cannot contain HTML markup."),

    body("price")
        .custom((value) =>
            typeof value === "number" &&
            Number.isSafeInteger(value) &&
            value >= 1
        )
        .withMessage("Price must be a positive whole number.")
];

// Validates the Gig ID when a client creates a booking
const bookingValidation = [
    body("gigId")
        .exists({ values: "null" })
        .withMessage("Gig ID is required.")
        .bail()
        .isString()
        .withMessage("Gig ID must be text.")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Gig ID is required.")
        .bail()
        .isUUID(4)
        .withMessage("Gig ID must be a valid UUID.")
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    gigValidation,
    bookingValidation,
    handleValidationErrors
};
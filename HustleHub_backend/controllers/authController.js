

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const logger = require("../utils/logger");
const { revokeToken } = require("../models/revokedTokenModel");

const {
    createUser,
    findUserByEmail,
    isAccountLocked,
    recordFailedLogin,
    resetFailedLogins
} = require("../models/userModel");

const { generateToken } = require("../utils/jwtUtils");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check whether the email is already registered
       const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists."
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 12);

        // Only allow normal user roles during registration
        const userRole = role === "freelancer" ? "freelancer" : "client";

        const newUser = {
            id: crypto.randomUUID(),
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: userRole
        };

        await createUser(newUser);

        // Never return the password/hash to the client
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while registering the user."
        });
    }
};





const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user in MongoDB.
        const user = await findUserByEmail(email);

        if (!user) {
            logger.warn("authentication.login_failed", {
                reason: "user_not_found"
            });

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // SECURITY: Check whether the account is locked.
        if (isAccountLocked(user)) {
            logger.warn("authentication.login_blocked", {
                userId: user.id,
                reason: "account_locked"
            });

            return res.status(429).json({
                success: false,
                message: "Account temporarily locked. Try again later."
            });
        }

        // Verify the supplied password.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {

            // Increase the failed login counter in MongoDB.
            const result = await recordFailedLogin(user.id);

            logger.warn("authentication.login_failed", {
                userId: user.id,
                reason: "incorrect_password",
                failedAttempts: result.attempts
            });

            // Lock the account after five failed attempts.
            if (result.locked) {
                logger.warn("authentication.account_locked", {
                    userId: user.id,
                    reason: "maximum_attempts_exceeded",
                    lockoutMinutes: 15
                });

                return res.status(429).json({
                    success: false,
                    message: "Account temporarily locked. Try again later."
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Successful login: clear the failed attempts.
        await resetFailedLogins(user.id);

        // Generate the JWT using the existing utility.
        const token = generateToken(user);

        logger.info("authentication.login_success", {
            userId: user.id,
            role: user.role
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        logger.error("authentication.login_error", {
            errorType: error.name
        });

        return res.status(500).json({
            success: false,
            message: "An error occurred while logging in."
        });
    }
};



// Code Attribution:
// Title: REST Security Cheat Sheet
// Author: OWASP Foundation
// Date Accessed: 7 November 2026
// Version: Online documentation
// Availability: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
// Purpose: Referenced for implementing secure
// JWT logout using server-side token revocation
// and authenticated session termination.


// SECURE JWT LOGOUT

const logoutUser = async (req, res) => {
    try {
        // Retrieve verified JWT claims from authMiddleware.
        const claims = req.tokenClaims;

        if (
            !claims ||
            !claims.jti ||
            !Number.isInteger(claims.exp)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication session."
            });
        }

        // Revoke the current JWT in MongoDB.
        await revokeToken(claims);

        // Log successful logout without exposing the JWT.
        logger.info("authentication.logout_success", {
            userId: req.user.id
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully. Session revoked."
        });

    } catch (error) {
        logger.error("authentication.logout_error", {
            userId: req.user?.id,
            errorType: error.name
        });

        return res.status(503).json({
            success: false,
            message: "Unable to log out securely. Please try again."
        });
    }
};



module.exports = {
    registerUser,
    loginUser,
    logoutUser
};

/*
 * Code attribution:
 * Title: bcrypt
 * Source: bcrypt package documentation
 * Available at: https://www.npmjs.com/package/bcrypt
 * Accessed: 12 October 2026
 * Relevance: Reference for password hashing and password
 * comparison during user authentication.
 */

/*
 * Code attribution:
 * Title: Crypto
 * Source: Node.js
 * Available at: https://nodejs.org/api/crypto.html
 * Accessed: 12 October 2026
 * Relevance: Reference for cryptographic functionality
 * used in authentication-related operations.
 */



// Code Attribution:
// Title: Winston Logging Library
// Author: Winston Contributors
// Date Accessed: 7 November 2026
// Version: See installed Winston package version
// Availability: https://github.com/winstonjs/winston
// Purpose: Referenced for recording successful and
// failed authentication attempts using structured
// information, warning, and error log levels.


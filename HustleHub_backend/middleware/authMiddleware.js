/*
    // Code Attribution:
    // Title: Node.js Security Cheat Sheet
    // Author: OWASP Foundation
    // Date Accessed: 12 October 2026
    // Version: Online documentation
    // Availability: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
    // Purpose: Referenced for security practices relevant to
    // authentication and protecting application routes.
*/

const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");
const { jwtSecret } = require("../config/config");
const { isTokenRevoked } = require("../models/revokedTokenModel");
const logger = require("../utils/logger");

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check that an Authorization header was provided
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required."
            });
        }

        // Expected format: Bearer <token>
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication format."
            });
        }

        const token = parts[1];

        // Verify the JWT
       const decoded = jwt.verify(
            token,
            jwtSecret
);


        // SECURITY: Reject tokens without a unique identifier.
        if (!decoded.jti) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is no longer valid. Please log in again."
            });
        }

        // SECURITY: Check the MongoDB revocation list.
        const revoked = await isTokenRevoked(decoded);

        if (revoked) {
            logger.warn("authentication.revoked_token_rejected", {
                userId: decoded.userId
            });

            return res.status(401).json({
                success: false,
                message: "This session has been logged out. Please log in again."
            });
        }

        // Make verified token claims available to the logout endpoint.
        req.tokenClaims = decoded;


        // Find the user associated with the token
        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User associated with this token was not found."
            });
        }

        // Attach authenticated user to the request
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();

    
    } catch (error) {
        const tokenErrors = [
            "JsonWebTokenError",
            "TokenExpiredError",
            "NotBeforeError"
        ];

        if (tokenErrors.includes(error.name)) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token."
            });
        }

        logger.error("authentication.middleware_error", {
            errorType: error.name
        });

        return res.status(503).json({
            success: false,
            message: "Authentication service temporarily unavailable."
        });
    }

};

module.exports = {
    authenticateToken
};
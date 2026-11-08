
/*
    // Code Attribution:
    // Title: Authorization Cheat Sheet
    // Author: OWASP Foundation
    // Date Accessed: 12 October 2026
    // Version: Online documentation
    // Availability: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
    // Purpose: Referenced for authorization principles and
    // restricting access according to user roles and permissions.
*/
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication is required."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource."
            });
        }

        next();
    };
};

module.exports = {
    authorizeRoles
};
/*
    // Code Attribution:
    // Title: Assistance in JWT
    // Author: ChatGPT
    // Date: 31 August 2026
    // Version: 1
    // Availiability: https://chatgpt.com/share/6a9d7dfe-f47c-83ea-ba8a-5d2efa9e8b6c 
*/

/*
    // Code Attribution:
    // Title: JSON Web Token (JWT)
    // Author: Internet Engineering Task Force (IETF)
    // Date Accessed: 12 October 2026
    // Version: RFC 7519
    // Availability: https://www.rfc-editor.org/rfc/rfc7519.html
    // Purpose: Referenced for understanding JWT structure and
    // claims used in token-based authentication.
*/
   
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const { randomUUID } = require("node:crypto");

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        jwtSecret,
        {
            expiresIn: "1h",
            jwtid: randomUUID()
        }
    );
};


module.exports = {
    generateToken
};
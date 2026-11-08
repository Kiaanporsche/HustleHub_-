
/*
    // Code Attribution:
    // Title: JSON Web Token Cheat Sheet and TTL Indexes
    // Author: OWASP Foundation and MongoDB, Inc.
    // Date Accessed: 7 November 2026
    // Version: Online documentation
    // Availability:
    // https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html
    // https://www.mongodb.com/docs/manual/core/index-ttl/
    // Purpose: Referenced for JWT revocation using
    // unique token identifiers and automatic expiry
    // cleanup in MongoDB.
*/

const { getDatabase } = require("../Data/mongoDb");

const getRevokedTokensCollection = () => {
    return getDatabase().collection("revokedTokens");
};

// Create indexes for fast lookup and expiry cleanup.
const ensureRevokedTokenIndexes = async () => {
    const collection = getRevokedTokensCollection();

    await collection.createIndex(
        { jti: 1 },
        { unique: true }
    );

    await collection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );
};

// Revoke a verified JWT using its unique identifier.
const revokeToken = async (claims) => {
    if (
        !claims ||
        typeof claims.jti !== "string" ||
        !Number.isInteger(claims.exp) ||
        claims.exp * 1000 <= Date.now()
    ) {
        throw new Error("Invalid or expired token claims.");
    }

    const collection = getRevokedTokensCollection();

    await collection.updateOne(
        { jti: claims.jti },
        {
            $setOnInsert: {
                jti: claims.jti,
                expiresAt: new Date(claims.exp * 1000),
                revokedAt: new Date()
            }
        },
        { upsert: true }
    );
};

// Check whether a verified JWT has been revoked.
const isTokenRevoked = async (claims) => {
    if (!claims || typeof claims.jti !== "string") {
        return true;
    }

    const revokedToken =
        await getRevokedTokensCollection().findOne({
            jti: claims.jti
        });

    return revokedToken !== null;
};

module.exports = {
    ensureRevokedTokenIndexes,
    revokeToken,
    isTokenRevoked
};

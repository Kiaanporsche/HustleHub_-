
/*
 * Code attribution:
 * Title: MongoDB CRUD Operations in Node.js
 * Source: MongoDB University
 * Available at: https://learn.mongodb.com/courses/mongodb-crud-operations-in-nodejs
 * Accessed: 12 October 2026
 * Relevance: Reference for creating, retrieving and
 * managing user records in MongoDB.
 */

const { getDatabase } = require("../Data/mongoDb");

const getUsersCollection = () => {
    return getDatabase().collection("users");
};

const createUser = async (user) => {
    await getUsersCollection().insertOne(user);

    return user;
};

const findUserByEmail = async (email) => {
    return await getUsersCollection().findOne({
        email: email.toLowerCase()
    });
};

const findUserById = async (id) => {
    return await getUsersCollection().findOne({
        id
    });
};


// Code Attribution:
// Title: Authentication Cheat Sheet
// Author: OWASP Foundation
// Date Accessed: 7 November 2026
// Version: Online documentation
// Availability: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
// Purpose: Referenced for implementing account
// lockout protection after repeated unsuccessful
// authentication attempts.


// ACCOUNT LOCKOUT SECURITY

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

// Check whether a user's account is currently locked.
const isAccountLocked = (user) => {
    if (!user.loginLockedUntil) {
        return false;
    }

    return new Date(user.loginLockedUntil).getTime() > Date.now();
};

// Record an unsuccessful login attempt.
const recordFailedLogin = async (userId) => {
    const collection = getUsersCollection();

    // Atomically increment the failed attempt counter.
    const updatedUser = await collection.findOneAndUpdate(
        { id: userId },
        { $inc: { failedLoginAttempts: 1 } },
        { returnDocument: "after" }
    );

    if (!updatedUser) {
        throw new Error("User not found.");
    }

    const attempts = updatedUser.failedLoginAttempts;

    if (attempts >= MAX_FAILED_ATTEMPTS) {
        await collection.updateOne(
            { id: userId },
            {
                $set: {
                    loginLockedUntil: new Date(
                        Date.now() + LOCKOUT_DURATION
                    ),
                    failedLoginAttempts: 0
                }
            }
        );

        return { locked: true, attempts };
    }

    return { locked: false, attempts };
};

// Reset failed attempts following successful login.
const resetFailedLogins = async (userId) => {
    await getUsersCollection().updateOne(
        { id: userId },
        {
            $set: { failedLoginAttempts: 0 },
            $unset: { loginLockedUntil: "" }
        }
    );
};


module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    isAccountLocked,
    recordFailedLogin,
    resetFailedLogins
};
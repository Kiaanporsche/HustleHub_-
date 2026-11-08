/*
 * Code attribution:
 * Title: MongoDB CRUD Operations in Node.js
 * Source: MongoDB University
 * Available at: https://learn.mongodb.com/courses/mongodb-crud-operations-in-nodejs
 * Accessed: 12 October 2026
 * Relevance: Reference for storing, retrieving and
 * querying transaction records in MongoDB.
 */


const { getDatabase } = require("../Data/mongoDb");

const getTransactionsCollection = () => {
    return getDatabase().collection("transactions");
};


// Insert a transaction using an optional MongoDB session.
// This allows transaction creation and booking approval
// to be committed together.
const insertTransaction = async (
    transaction,
    session = null
) => {
    const options = session ? { session } : {};

    await getTransactionsCollection().insertOne(
        transaction,
        options
    );

    return transaction;
};


const getTransactionsByClientId = async (clientId) => {
    return await getTransactionsCollection().find({
        clientId
    }).toArray();
};

const getTransactionsByFreelancerId = async (freelancerId) => {
    return await getTransactionsCollection().find({
        freelancerId
    }).toArray();
};

const getFreelancerIncome = async (freelancerId) => {
    const result = await getTransactionsCollection().aggregate([
        {
            $match: {
                freelancerId,
                status: "completed"
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: "$amount"
                }
            }
        }
    ]).toArray();

    return result.length > 0 ? result[0].totalIncome : 0;
};

module.exports = {
    insertTransaction,
     getTransactionsByClientId,
    getTransactionsByFreelancerId,
     getFreelancerIncome
};
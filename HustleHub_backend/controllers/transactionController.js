/*
    // Code Attribution:
    // Title: Express Routing
    // Author: Express.js Team
    // Date Accessed: 12 October 2026
    // Version: Check installed Express version in package.json
    // Availability: https://expressjs.com/en/guide/routing.html
    // Purpose: Referenced for handling transaction requests,
    // retrieving transaction records, and returning freelancer
    // income information through controller functions.
*/

const crypto = require("crypto");
const { getDatabase } = require("../Data/mongoDb");
const {getTransactionsByClientId,getTransactionsByFreelancerId, getFreelancerIncome } = require("../models/transactionModel");
const { getBookingById } = require("../models/bookingModel");
const { getGigById } = require("../models/gigModel");    


/*
    // Code Attribution:
    // Title: Aggregation Operations
    // Author: MongoDB, Inc.
    // Date Accessed: 12 October 2026
    // Version: MongoDB Node.js Driver
    // Availability: https://www.mongodb.com/docs/drivers/node/current/aggregation/
    // Purpose: Referenced for understanding how MongoDB
    // aggregation can calculate totals from transaction
    // records and support freelancer income reporting.
*/

const getClientTransactions = async (req, res) => {
    try {
        const transactions = await getTransactionsByClientId(req.user.id);

        const transactionsWithGigDetails = await Promise.all(transactions.map(async (transaction) => {
            const booking = await getBookingById(transaction.bookingId);
            const gig = booking ? await getGigById(booking.gigId) : null;

            return {
                ...transaction,
                gigTitle: gig?.title || "Freelance Service",
                gigCategory: gig?.category || "General"
            };
        })
    );

        res.status(200).json({
            success: true,
            transactions: transactionsWithGigDetails
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve client transactions."
        });
    }
};

const getFreelancerTransactions = async (req, res) => {
    try {
        const transactions = await getTransactionsByFreelancerId(req.user.id);

        res.status(200).json({
            success: true,
            transactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve freelancer transactions."
        });
    }
};



const getFreelancerIncomeTotal = async (req, res) => {
    try {
        const income = await getFreelancerIncome(req.user.id);

        res.status(200).json({
            success: true,
            income
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to calculate freelancer income."
        });
    }
};

module.exports = {
    
    getClientTransactions,
    getFreelancerTransactions,
     getFreelancerIncomeTotal
};
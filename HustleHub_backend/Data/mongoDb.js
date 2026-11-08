
/*
    // Code Attribution:
    // Title: Connect to MongoDB
    // Author: MongoDB
    // Date Accessed: 12 October 2026
    // Version: MongoDB Node.js Driver
    // Availability: https://www.mongodb.com/docs/drivers/node/current/connect/
    // Purpose: Referenced for establishing a connection between
    // the HustleHub+ backend and the MongoDB database.
*/
const { MongoClient } = require("mongodb");

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
    throw new Error("MONGODB_URI is not configured.");
}

const client = new MongoClient(connectionString);

let database;

async function connectToDatabase() {
    if (database) {
        return database;
    }

    try {
        await client.connect();

        database = client.db("HustleHub");

        console.log("Connected to MongoDB.");

        return database;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    throw error;
    }
}

function getDatabase() {
    if (!database) {
        throw new Error("Database has not been connected.");
    }

    return database;
}

// Return the MongoDB client so controllers can
// start database transactions when needed.
function getMongoClient() {
    return client;
}

module.exports = {
    connectToDatabase,
    getDatabase,
    getMongoClient
};
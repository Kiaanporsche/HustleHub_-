
/*
 * Code attribution:
 * Title: MongoDB CRUD Operations in Node.js
 * Source: MongoDB University
 * Available at: https://learn.mongodb.com/courses/mongodb-crud-operations-in-nodejs
 * Accessed: 12 October 2026
 */

const { getDatabase } = require("../Data/mongoDb");

const getGigsCollection = () => {
    return getDatabase().collection("gigs");
};

const insertGig = async (gig) => {
    await getGigsCollection().insertOne(gig);

    return gig;
};


const getGigs = async () => {
    return await getGigsCollection().find({}).toArray();
};

const getGigById = async (id) => {
    return await getGigsCollection().findOne({
        id
    });
};

const updateGig = async (id, updates) => {
    return await getGigsCollection().updateOne(
        { id },
        { $set: updates }
    );
};

const deleteGig = async (id) => {
    return await getGigsCollection().deleteOne({
        id
    });
};

const getGigsByFreelancerId = async (freelancerId) => {
    return await getGigsCollection().find({
        freelancerId
    }).toArray();
};

module.exports = {
    insertGig,
      getGigs,
    getGigsByFreelancerId,
    getGigById,
    updateGig,
    deleteGig
};
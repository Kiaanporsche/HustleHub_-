
/*
 * Code attribution:
 * Title: MongoDB CRUD Operations in Node.js
 * Source: MongoDB University
 * Available at: https://learn.mongodb.com/courses/mongodb-crud-operations-in-nodejs
 * Accessed: 12 October 2026
 * Relevance: Reference for storing and retrieving
 * booking records using MongoDB.
 */

const { getDatabase } = require("../Data/mongoDb");

const getBookingsCollection = () => {
    return getDatabase().collection("bookings");
};

// Create a new booking request
const insertBooking = async (booking) => {
    await getBookingsCollection().insertOne(booking);

    return booking;
};

// Find a booking using its ID
const getBookingById = async (id) => {
    return await getBookingsCollection().findOne({
        id
    });
};

// Retrieve bookings made by a client
const getBookingsByClientId = async (clientId) => {
    return await getBookingsCollection().find({
        clientId
    }).toArray();
};

// Retrieve booking requests received by a freelancer
const getBookingsByFreelancerId = async (freelancerId) => {
    return await getBookingsCollection().find({
        freelancerId
    }).toArray();
};


// Update a pending booking inside an optional
// MongoDB transaction.
const updateBookingStatus = async (
    bookingId,
    freelancerId,
    newStatus,
    session = null
) => {
    const options = {
        returnDocument: "after"
    };

    if (session) {
        options.session = session;
    }

    return await getBookingsCollection().findOneAndUpdate(
        {
            id: bookingId,
            freelancerId,
            status: "pending"
        },
        {
            $set: {
                status: newStatus,
                updatedAt: new Date()
            }
        },
        options
    );
};


// Check whether a gig has any existing booking history.
// Used to prevent freelancers from deleting booked gigs.
const hasBookingsForGig = async (gigId) => {
    const booking = await getBookingsCollection().findOne({
        gigId
    });

    return booking !== null;
};

module.exports = {
    insertBooking,
    getBookingById,
    getBookingsByClientId,
    getBookingsByFreelancerId,
    updateBookingStatus,
    hasBookingsForGig
};

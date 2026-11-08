
/*
    // Code Attribution:
    // Title: Express Routing
    // Author: Express.js Team
    // Date Accessed: 12 October 2026
    // Version: Check installed Express version in package.json
    // Availability: https://expressjs.com/en/guide/routing.html
    // Purpose: Referenced for understanding request handling
    // for booking creation and retrieving bookings associated
    // with authenticated clients and freelancers.
*/

/*
    // Code Attribution:
    // Title: Winston Logging Library
    // Author: Winston Contributors
    // Date Accessed: 7 November 2026
    // Version: See installed Winston package version
    // Availability: https://github.com/winstonjs/winston
    // Purpose: Referenced for implementing structured
    // logging of booking creation, approval, rejection,
    // transaction creation, and security-related errors
    // in the HustleHub+ backend.
*/


const crypto = require("crypto");
const logger = require("../utils/logger");

const { getMongoClient } = require("../Data/mongoDb");
const { getGigById } = require("../models/gigModel");

const {
    insertBooking,
    getBookingById,
    getBookingsByClientId,
    getBookingsByFreelancerId,
    updateBookingStatus
} = require("../models/bookingModel");

const {
    insertTransaction
} = require("../models/transactionModel");

/*
    // Code Attribution:
    // Title: Insert Documents
    // Author: MongoDB, Inc.
    // Date Accessed: 12 October 2026
    // Version: MongoDB Node.js Driver
    // Availability: https://www.mongodb.com/docs/drivers/node/current/crud/insert/
    // Purpose: Referenced for inserting booking records into
    // MongoDB and supporting the creation of transaction
    // records when clients book freelancer services.
*/

/*
    // Code Attribution:
    // Title: ChatGPT - Atomic Booking Approval Workflow
    // Author: OpenAI (ChatGPT)
    // Date Accessed: 19 October 2026
    // Version: ChatGPT
    // Availability: https://chatgpt.com/
    // Purpose: Assisted with implementing booking approval
    // and rejection, freelancer ownership checks, and MongoDB
    // transactions to ensure booking approval and transaction
    // creation are saved together.
*/

// Create a new booking request from a client.
// The booking starts as pending and no transaction is created.
const createBooking = async (req, res) => {
    try {
        const gig = await getGigById(req.body.gigId);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found."
            });
        }

        const booking = {
            id: crypto.randomUUID(),
            gigId: gig.id,
            clientId: req.user.id,
            freelancerId: gig.freelancerId,
            price: gig.price,
            status: "pending",
            createdAt: new Date()
        };

        await insertBooking(booking);

        // Log a successfully created booking request.
        logger.info("booking.created", {
            bookingId: booking.id,
            gigId: booking.gigId,
            clientId: booking.clientId,
            freelancerId: booking.freelancerId,
            status: booking.status
        });

        return res.status(201).json({
            success: true,
            message:
                "Booking request submitted. Waiting for freelancer approval.",
            booking
        });

    } catch (error) {
        logger.error("booking.creation_error", {
            errorType: error.name
        });

        return res.status(500).json({
            success: false,
            message: "Failed to create booking request."
        });
    }
};


// Allow the freelancer to approve or reject a booking request.
// Only the freelancer associated with the booking may do this.
const updateBookingRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        // Validate the requested status.
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected."
            });
        }

        // Find the existing booking.
        const booking = await getBookingById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking request not found."
            });
        }

        // Prevent freelancers from managing other users' bookings.
        if (booking.freelancerId !== req.user.id) {

            logger.warn("booking.unauthorized_status_change", {
                bookingId: booking.id,
                attemptedBy: req.user.id
            });
            return res.status(403).json({
                success: false,
                message:
                    "You cannot manage another freelancer's booking."
            });
        }

        // Only pending requests can be approved or rejected.
        // This also preserves older confirmed bookings.
        if (booking.status !== "pending") {
            return res.status(409).json({
                success: false,
                message: "This booking has already been processed."
            });
        }

        // A rejection does not require a transaction record.
        if (status === "rejected") {
            const rejectedBooking = await updateBookingStatus(
                id,
                req.user.id,
                "rejected"
            );

            // Prevent processing the same booking twice.
            if (!rejectedBooking) {
                return res.status(409).json({
                    success: false,
                    message: "Booking status has already changed."
                });
            }

            // Record a successful booking rejection.
            logger.info("booking.rejected", {
                bookingId: rejectedBooking.id,
                freelancerId: req.user.id,
                status: "rejected"
            });

            return res.status(200).json({
                success: true,
                message: "Booking request rejected.",
                booking: rejectedBooking
            });
        }

        // Approvals require a MongoDB transaction because
        // the booking and transaction must be saved together.
        const client = getMongoClient();
        const session = client.startSession();

        let approvedBooking = null;
        let createdTransaction = null;
        let bookingAlreadyProcessed = false;

        try {
            await session.withTransaction(async () => {

                // Update only if the booking is still pending.
                // The session makes this update part of the
                // same database transaction as the payment record.
                const updatedBooking = await updateBookingStatus(
                    id,
                    req.user.id,
                    "approved",
                    session
                );

                if (!updatedBooking) {
                    bookingAlreadyProcessed = true;
                    return;
                }

                // Create a simulated completed transaction.
                // No actual payment is processed.
                const transaction = {
                    id: crypto.randomUUID(),
                    bookingId: updatedBooking.id,
                    clientId: updatedBooking.clientId,
                    freelancerId: updatedBooking.freelancerId,
                    amount: updatedBooking.price,
                    status: "completed",
                    createdAt: new Date()
                };

                await insertTransaction(transaction, session);

                approvedBooking = updatedBooking;
                createdTransaction = transaction;
            });

        } finally {
            // Always close the session, even if approval fails.
            await session.endSession();
        }

        if (bookingAlreadyProcessed || !approvedBooking) {
            return res.status(409).json({
                success: false,
                message: "Booking status has already changed."
            });
        }

        // Record the successful booking approval.
        logger.info("booking.approved", {
            bookingId: approvedBooking.id,
            freelancerId: req.user.id,
            status: "approved"
        });

        // Record the transaction after the database transaction commits.
        logger.info("transaction.created", {
            transactionId: createdTransaction.id,
            bookingId: createdTransaction.bookingId,
            clientId: createdTransaction.clientId,
            freelancerId: createdTransaction.freelancerId,
            status: createdTransaction.status
        });

        return res.status(200).json({
            success: true,
            message:
                "Booking approved and transaction created successfully.",
            booking: approvedBooking,
            transaction: createdTransaction
        });

    } catch (error) {
        logger.error("booking.status_update_error", {
            errorType: error.name
        });

        return res.status(500).json({
            success: false,
            message: "Failed to update booking status."
        });
    }
};


// Retrieve bookings made by the logged-in client.
const getClientBookings = async (req, res) => {
    try {
        const bookings = await getBookingsByClientId(req.user.id);

        const bookingsWithGigDetails = await Promise.all(
            bookings.map(async (booking) => {
                const gig = await getGigById(booking.gigId);

                return {
                    ...booking,
                    gigTitle: gig?.title || "Freelance Service",
                    gigCategory: gig?.category || "General"
                };
            })
        );

        return res.status(200).json({
            success: true,
            bookings: bookingsWithGigDetails
        });

    } catch (error) {
        console.error("Get client bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve client bookings."
        });
    }
};


// Retrieve booking requests received by the freelancer.
const getFreelancerBookings = async (req, res) => {
    try {
        const bookings = await getBookingsByFreelancerId(req.user.id);

        const bookingsWithGigDetails = await Promise.all(
            bookings.map(async (booking) => {
                const gig = await getGigById(booking.gigId);

                return {
                    ...booking,
                    gigTitle: gig?.title || "Freelance Service",
                    gigCategory: gig?.category || "General"
                };
            })
        );

        return res.status(200).json({
            success: true,
            bookings: bookingsWithGigDetails
        });

    } catch (error) {
        console.error("Get freelancer bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve freelancer bookings."
        });
    }
};

module.exports = {
    createBooking,
    updateBookingRequestStatus,
    getClientBookings,
    getFreelancerBookings
};


/*
 * Code attribution:
 * Title: Express Routing
 * Source: Express.js
 * Available at: https://expressjs.com/en/guide/routing.html
 * Accessed: 12 October 2026
 * Relevance: Reference for defining booking endpoints
 * and mapping requests to route handlers.
 */

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    createBooking,
    getClientBookings,
    getFreelancerBookings,
    updateBookingRequestStatus
} = require("../controllers/bookingController");

const {
    bookingValidation,
    handleValidationErrors
} = require("../middleware/validationMiddleware");

const { bookingLimiter } = require("../middleware/rateLimitMiddleware");

// Create a new booking request.
// Only clients can request to book a freelancer's gig.
// The booking starts with a "pending" status.
router.post(
    "/",
    authenticateToken,
    authorizeRoles("client"),
    bookingLimiter,
    bookingValidation,
    handleValidationErrors,
    createBooking
);

// Retrieve all bookings made by the logged-in client.
router.get(
    "/client",
    authenticateToken,
    authorizeRoles("client"),
    getClientBookings
);

// Retrieve booking requests received by the logged-in freelancer.
router.get(
    "/freelancer",
    authenticateToken,
    authorizeRoles("freelancer"),
    getFreelancerBookings
);

// Approve or reject a pending booking request.
// Only freelancers can access this endpoint.
// The controller also verifies that the booking
// belongs to the authenticated freelancer.
router.patch(
    "/:id/status",
    authenticateToken,
    authorizeRoles("freelancer"),
    bookingLimiter,
    updateBookingRequestStatus
);

module.exports = router;

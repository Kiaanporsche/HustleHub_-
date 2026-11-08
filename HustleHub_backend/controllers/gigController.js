
/*
    // Code Attribution:
    // Title: Express Routing
    // Author: Express.js Team
    // Date Accessed: 12 October 2026
    // Version: Check installed Express version in package.json
    // Availability: https://expressjs.com/en/guide/routing.html
    // Purpose: Referenced for understanding how HTTP requests
    // are handled by Express controllers for gig creation,
    // retrieval, updating, and deletion.
*/

const crypto = require("crypto");

const {
    insertGig,
    getGigs,
    getGigsByFreelancerId,
    getGigById,
    updateGig,
    deleteGig
} = require("../models/gigModel");

// Check whether a gig has any existing booking requests.
// This function was added to prevent deletion of booked gigs.
const { hasBookingsForGig } = require("../models/bookingModel");


// Create a new gig
const createGig = async (req, res) => {
    try {
        const { title, description, category, price } = req.body;

        const gig = {
            id: crypto.randomUUID(),
            freelancerId: req.user.id,
            title,
            description,
            category,
            price,
            createdAt: new Date()
        };

        await insertGig(gig);

        res.status(201).json({
            success: true,
            message: "Gig created successfully.",
            gig
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create gig."
        });
    }
};


// Retrieve all gigs
const getAllGigs = async (req, res) => {
    try {
        const gigs = await getGigs();

        res.status(200).json({
            success: true,
            gigs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve gigs."
        });
    }
};


// Retrieve gigs belonging to the logged-in freelancer
const getMyGigs = async (req, res) => {
    try {
        const gigs = await getGigsByFreelancerId(req.user.id);

        res.status(200).json({
            success: true,
            gigs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve your gigs."
        });
    }
};


// Retrieve a single gig
const getGig = async (req, res) => {
    try {
        const gig = await getGigById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found."
            });
        }

        res.status(200).json({
            success: true,
            gig
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve gig."
        });
    }
};

 // Update an existing gig only if it has no booking history
const editGig = async (req, res) => {
    try {
        const gig = await getGigById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found."
            });
        }

        // Only the freelancer who created the gig
        // is allowed to update it.
        if (gig.freelancerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own gigs."
            });
        }

        // Prevent editing once any booking request exists,
        // including pending, approved or rejected bookings.
        const hasBookings = await hasBookingsForGig(gig.id);

        if (hasBookings) {
            return res.status(409).json({
                success: false,
                message:
                    "This gig cannot be edited because it has existing booking requests or booking history."
            });
        }

        const { title, description, category, price } = req.body;

        const updates = {
            title,
            description,
            category,
            price,
            updatedAt: new Date()
        };

        await updateGig(req.params.id, updates);

        return res.status(200).json({
            success: true,
            message: "Gig updated successfully."
        });

    } catch (error) {
        console.error("Edit gig error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update gig."
        });
    }
};



// Delete a gig only if it has no booking history
const removeGig = async (req, res) => {
    try {
        const gig = await getGigById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found."
            });
        }

        // Only the freelancer who created the gig
        // is allowed to delete it.
        if (gig.freelancerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own gigs."
            });
        }

        // NEW: Check whether any client has requested
        // or previously booked this gig.
        const hasBookings = await hasBookingsForGig(gig.id);

        if (hasBookings) {
            return res.status(409).json({
                success: false,
                message:
                    "This gig cannot be deleted because it has existing booking requests or booking history."
            });
        }

        // Only delete the gig if no bookings exist.
        await deleteGig(req.params.id);

        res.status(200).json({
            success: true,
            message: "Gig deleted successfully."
        });

    } catch (error) {
        console.error("Delete gig error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete gig."
        });
    }
};


module.exports = {
    createGig,
    getAllGigs,
    getMyGigs,
    getGig,
    editGig,
    removeGig
};

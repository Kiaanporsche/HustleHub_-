
/*
 * Code attribution:
 * Title: Express - Getting Started
 * Source: Express.js
 * Available at: https://expressjs.com/
 * Accessed: 12 October 2026
 * Relevance: Reference for configuring and running
 * an Express web application.
 */


// Code Attribution:
// Title: Run a Database Command
// Author: MongoDB, Inc.
// Date Accessed: 7 November 2026
// Version: MongoDB Node.js Driver 7
// Availability: https://www.mongodb.com/docs/drivers/node/current/run-command/
// Purpose: Referenced for implementing an API health
// monitoring endpoint that checks MongoDB availability
// using the database ping command.



require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["1.1.1.1"]);

const {connectToDatabase, getDatabase} = require("./Data/mongoDb");
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure HTTP security headers using Helmet
app.use(helmet({
    // Content Security Policy for the backend API
    contentSecurityPolicy: {
        useDefaults: false,
        
        directives: {
            // The backend serves JSON, not webpages or executable scripts.
            defaultSrc: ["'none'"],

            // Prevent external scripts, styles, images and connections.
            scriptSrc: ["'none'"],
            styleSrc: ["'none'"],
            imgSrc: ["'none'"],
            connectSrc: ["'none'"],

            // Prevent plugins, embedded content and framing.
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"],

            // Prevent base URL changes and form submissions.
            baseUri: ["'none'"],
            formAction: ["'none'"]
        }

    },

    // Prevent the API from being embedded in frames
    xFrameOptions: {
        action: "deny"
    },

    // Avoid enforcing HTTPS across other localhost ports
    // during development
    hsts: process.env.NODE_ENV === "production"
}));

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const gigRoutes = require("./routes/gigRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const { ensureCategoryIndexes } = require("./models/categoryModel");
const { ensureRevokedTokenIndexes } = require("./models/revokedTokenModel");

// Middleware to allow JSON request bodies
app.use(express.json());


/*
 * Configure CORS for both development and Docker.
 *
 * Development frontend: http://localhost:5173
 * Docker frontend:      http://localhost:8080
 */
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// SYSTEM HEALTH MONITORING

// Check whether the API and MongoDB are operational.
app.get("/api/health", async (req, res) => {
    try {
        const db = getDatabase();

        // Verify MongoDB responds to a ping.
        await db.command({ ping: 1 });

        return res.status(200).json({
            status: "healthy",
            service: "HustleHub API",
            database: "connected"
        });

    } catch (error) {

        logger.error("monitor.health_check_failed", {
            errorType: error.name
        });

        return res.status(503).json({
            status: "unhealthy",
            message: "Service temporarily unavailable."
        });
    }
});



// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use(errorMiddleware);

const sslOptions = {
    key: fs.readFileSync("./ssl/key.pem"),
    cert: fs.readFileSync("./ssl/cert.pem")
};


connectToDatabase()
    .then(async () => {
        // Ensure category names are unique in MongoDB.
        await ensureCategoryIndexes();

        
        // SECURITY: Initialise JWT revocation indexes.
        await ensureRevokedTokenIndexes();

        // Confirm the revocation indexes are ready.
        logger.info("security.token_revocation_indexes_ready");


        https.createServer(sslOptions, app).listen(PORT, () => {
            console.log(`HustleHub API running on https://localhost:${PORT}`);
        });
    })

    .catch(() => {
        console.error("Server could not start because MongoDB connection failed.");
        process.exit(1);
    });

    

// Code Attribution:
// Title: TTL Indexes
// Author: MongoDB, Inc.
// Date Accessed: 7 November 2026
// Version: MongoDB Documentation
// Availability: https://www.mongodb.com/docs/manual/core/index-ttl/
// Purpose: Referenced for initialising MongoDB
// indexes that support JWT revocation and
// automatic cleanup of expired token records.


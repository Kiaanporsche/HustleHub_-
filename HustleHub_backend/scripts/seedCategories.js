
/*
 * Code attribution:
 * Title: MongoDB CRUD Operations
 * Source: MongoDB
 * Available at: https://www.mongodb.com/docs/drivers/node/current/crud/
 * Accessed: 28 October 2026
 * Relevance: Reference for retrieving existing gig categories
 * and inserting unique categories into MongoDB.
 */

require("dotenv").config();

const {
    connectToDatabase,
    getDatabase
} = require("../Data/mongoDb");

const {
    ensureCategoryIndexes
} = require("../models/categoryModel");

const seedCategories = async () => {
    try {
        await connectToDatabase();
        await ensureCategoryIndexes();

        const database = getDatabase();

        // Retrieve the categories already used by existing gigs.
        const existingGigCategories = await database
            .collection("gigs")
            .distinct("category");

        // Include initial categories for new freelancers.
        const defaultCategories = [
            "Marketing",
            "Graphic Design",
            "Web Development",
            "Writing",
            "Photography",
            "Video Editing",
            "Business Support"
        ];

        const allCategories = [
            ...defaultCategories,
            ...existingGigCategories
        ];

        let addedCount = 0;

        for (const categoryName of allCategories) {
            if (
                typeof categoryName !== "string" ||
                !categoryName.trim()
            ) {
                continue;
            }

            const cleanName = categoryName.trim().replace(/\s+/g, " ");
            const normalizedName = cleanName.toLowerCase();

            // Upsert prevents duplicate categories if the script is rerun.
            const result = await database
                .collection("categories")
                .updateOne(
                    { normalizedName },
                    {
                        $setOnInsert: {
                            name: cleanName,
                            normalizedName,
                            createdAt: new Date()
                        }
                    },
                    { upsert: true }
                );

            if (result.upsertedCount > 0) {
                addedCount++;
            }
        }

        console.log(
            `Category seeding completed. ${addedCount} categories added.`
        );
    } catch (error) {
        console.error("Category seeding failed:", error);
        process.exitCode = 1;
    } finally {
        process.exit();
    }
};

seedCategories();

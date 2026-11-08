
/*
 * Code Attribution:
 * Title: Express Routing
 * Author: Express.js Team
 * Availability: https://expressjs.com/en/guide/routing.html
 * Purpose: Referenced for implementing API controllers
 * to retrieve and create categories in HustleHub+.
 */

const {
    getCategories,
    getCategoryByName,
    insertCategory
} = require("../models/categoryModel");

// Retrieve all available categories.
const getAllCategories = async (req, res) => {
    try {
        const categories = await getCategories();

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories."
        });
    }
};

// Allow an authenticated freelancer to add a category.
const createCategory = async (req, res) => {
    try {
        // Category name validation will also be enforced
        // by middleware before this controller is called.
        const name = req.body.name.trim().replace(/\s+/g, " ");

        // Check whether the category already exists.
        const existingCategory = await getCategoryByName(name);

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "This category already exists."
            });
        }

        // Save the new category in MongoDB.
        const category = await insertCategory(name);

        return res.status(201).json({
            success: true,
            message: "Category added successfully.",
            category
        });
    } catch (error) {
        // MongoDB duplicate-key error.
        // This also protects against simultaneous submissions.
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This category already exists."
            });
        }

        console.error("Create category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add category."
        });
    }
};

module.exports = {
    getAllCategories,
    createCategory
};

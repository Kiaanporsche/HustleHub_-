
/*
 * Code Attribution:
 * Title: MongoDB CRUD Operations
 * Author: MongoDB
 * Availability: https://www.mongodb.com/docs/drivers/node/current/crud/
 * Purpose: Referenced for storing, retrieving and
 * preventing duplicate categories in HustleHub+.
 */

const { getDatabase } = require("../Data/mongoDb");

// Access the categories collection in MongoDB.
const getCategoriesCollection = () => {
    return getDatabase().collection("categories");
};

// Retrieve all categories alphabetically.
const getCategories = async () => {
    return await getCategoriesCollection()
        .find({})
        .sort({ name: 1 })
        .toArray();
};

// Find an existing category by its normalised name.
const getCategoryByName = async (name) => {
    return await getCategoriesCollection().findOne({
        normalizedName: name.trim().toLowerCase()
    });
};

// Ensure category names are unique, ignoring case.
const ensureCategoryIndexes = async () => {
    await getCategoriesCollection().createIndex(
        { normalizedName: 1 },
        { unique: true }
    );
};

// Add a new category to MongoDB.
const insertCategory = async (name) => {
    const cleanName = name.trim().replace(/\s+/g, " ");

    const category = {
        name: cleanName,
        normalizedName: cleanName.toLowerCase(),
        createdAt: new Date()
    };

    await getCategoriesCollection().insertOne(category);

    return category;
};

module.exports = {
    getCategories,
    getCategoryByName,
    ensureCategoryIndexes,
    insertCategory
};

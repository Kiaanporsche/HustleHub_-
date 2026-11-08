
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function CreateGigPage() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Category dropdown state.
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Load categories from MongoDB when the page opens.
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories");

                setCategories(response.data.categories || []);
            } catch (error) {
                console.error("Unable to load categories:", error);

                setCategoryError(
                    "Unable to load categories. Please refresh the page."
                );
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Display field-specific validation errors from the backend.
    const getValidationMessage = (error, fallbackMessage) => {
        const validationErrors = error.response?.data?.errors;

        if (
            Array.isArray(validationErrors) &&
            validationErrors.length > 0
        ) {
            const fieldLabels = {
                title: "Gig Title",
                description: "Description",
                category: "Category",
                name: "Category Name",
                price: "Price"
            };

            return validationErrors
                .map((validationError) => {
                    const field =
                        validationError.path ||
                        validationError.param ||
                        validationError.field;

                    const fieldName =
                        fieldLabels[field] || field || "Form";

                    const message =
                        validationError.msg ||
                        validationError.message ||
                        "Invalid value.";

                    return `${fieldName}: ${message}`;
                })
                .join("\n");
        }

        return (
            error.response?.data?.message ||
            fallbackMessage
        );
    };

    // Add a new category and automatically select it.
    const handleAddCategory = async () => {
        setCategoryError("");

        const cleanName = newCategory.trim().replace(/\s+/g, " ");

        if (!cleanName) {
            setCategoryError("Please enter a category name.");
            return;
        }

        // Check for duplicates before sending the request.
        const existingCategory = categories.find(
            (item) =>
                item.name.toLowerCase() === cleanName.toLowerCase()
        );

        if (existingCategory) {
            setCategoryError("This category already exists.");
            return;
        }

        setIsAddingCategory(true);

        try {
            const response = await api.post("/categories", {
                name: cleanName
            });

            const addedCategory = response.data.category;

            // Add the category to the dropdown alphabetically.
            setCategories((previousCategories) =>
                [...previousCategories, addedCategory].sort(
                    (a, b) => a.name.localeCompare(b.name)
                )
            );

            // Select the newly added category.
            setCategory(addedCategory.name);

            setNewCategory("");
            setShowAddCategory(false);
            setCategoryError("");
        } catch (error) {
            setCategoryError(
                getValidationMessage(
                    error,
                    "Unable to add category. Please try again."
                )
            );
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");

        if (!category) {
            setErrorMessage("Category: Please select a category.");
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post("/gigs", {
                title,
                description,
                category,
                price: Number(price)
            });

            navigate("/freelancer/gigs");

        } catch (error) {
            // Show the field name alongside each backend validation error.
            setErrorMessage(
                getValidationMessage(
                    error,
                    "Unable to save your gig. Please try again."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">
                    FREELANCER WORKSPACE
                </span>

                <h1>Create Gig</h1>

                <p>
                    Add a new freelance service to HustleHub+.
                </p>
            </div>

            <div className="form-card">
                {errorMessage && (
                    <div
                        className="error-message"
                        role="alert"
                        style={{ whiteSpace: "pre-line" }}
                    >
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">
                            Gig Title
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            placeholder="e.g. Social Media Management"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">
                            Category
                        </label>

                        <select
                            id="category"
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                            required
                            disabled={isLoadingCategories}
                        >
                            <option value="">
                                {isLoadingCategories
                                    ? "Loading categories..."
                                    : "Select a category"}
                            </option>

                            {categories.map((item) => (
                                <option
                                    key={item._id || item.name}
                                    value={item.name}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ marginTop: "12px" }}
                            onClick={() => {
                                setShowAddCategory(!showAddCategory);
                                setCategoryError("");
                            }}
                        >
                            {showAddCategory
                                ? "Cancel New Category"
                                : "+ Add New Category"}
                        </button>
                    </div>

                    {showAddCategory && (
                        <div className="form-group">
                            <label htmlFor="newCategory">
                                New Category Name
                            </label>

                            <input
                                id="newCategory"
                                type="text"
                                value={newCategory}
                                onChange={(event) =>
                                    setNewCategory(event.target.value)
                                }
                                placeholder="e.g. Interior Design"
                                maxLength={50}
                            />

                            {categoryError && (
                                <div
                                    className="error-message"
                                    role="alert"
                                    style={{
                                        marginTop: "10px",
                                        whiteSpace: "pre-line"
                                    }}
                                >
                                    {categoryError}
                                </div>
                            )}

                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ marginTop: "12px" }}
                                onClick={handleAddCategory}
                                disabled={isAddingCategory}
                            >
                                {isAddingCategory
                                    ? "Adding..."
                                    : "Add Category"}
                            </button>
                        </div>
                    )}

                    {!showAddCategory && categoryError && (
                        <div
                            className="error-message"
                            role="alert"
                        >
                            {categoryError}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Describe the service you offer"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">
                            Price (R)
                        </label>

                        <input
                            id="price"
                            type="number"
                            min="1"
                            step="1"
                            value={price}
                            onChange={(event) =>
                                setPrice(event.target.value)
                            }
                            placeholder="750"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <Link
                            to="/freelancer/gigs"
                            className="btn btn-secondary"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                isSubmitting ||
                                isLoadingCategories ||
                                showAddCategory ||
                                Boolean(categoryError)
                            }
                        >
                            {isSubmitting
                                ? "Creating..."
                                : "Create Gig"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default CreateGigPage;

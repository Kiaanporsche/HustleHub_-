
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import GigCard from "../components/GigCard.jsx";

/*
    // Code Attribution:
    // Title: useEffect
    // Author: React Team (Meta)
    // Date Accessed: 12 October 2026
    // Version: React 19
    // Availability: https://react.dev/reference/react/useEffect
    // Purpose: Referenced for fetching and displaying gig
    // information from the HustleHub+ backend when React
    // components are rendered or dependencies change.
*/

function BrowseGigsPage() {
    const [gigs, setGigs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Load gigs and categories from the backend.
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setErrorMessage("");
            setCategoryError("");

            try {
                // Retrieve available gigs.
                const gigsResponse = await api.get("/gigs");

                setGigs(gigsResponse.data.gigs || []);

                // Retrieve categories stored in MongoDB.
                try {
                    const categoriesResponse =
                        await api.get("/categories");

                    setCategories(
                        categoriesResponse.data.categories || []
                    );
                } catch (error) {
                    console.error(
                        "Unable to load categories:",
                        error
                    );

                    // Gig browsing still works if the
                    // category endpoint is temporarily unavailable.
                    setCategoryError(
                        "Unable to load category filters. You can still search gigs."
                    );
                }
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load gigs."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter gigs by search term and selected category.
    const filteredGigs = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return gigs.filter((gig) => {
            const matchesSearch =
                !search ||
                gig.title?.toLowerCase().includes(search) ||
                gig.description?.toLowerCase().includes(search) ||
                gig.category?.toLowerCase().includes(search);

            const matchesCategory =
                selectedCategory === "all" ||
                gig.category?.toLowerCase() ===
                    selectedCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });
    }, [gigs, searchTerm, selectedCategory]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("all");
    };

    if (isLoading) {
        return (
            <main className="page-container">
                <p>Loading gigs...</p>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">
                    CLIENT MARKETPLACE
                </span>

                <h1>Browse Gigs</h1>

                <p>
                    Find scoped services from independent talent.
                </p>
            </div>

            {!errorMessage && gigs.length > 0 && (
                <div className="gig-filter-bar">
                    <div className="gig-search">
                        <span className="gig-search-icon">⌕</span>

                        <input
                            type="text"
                            placeholder="Search gigs, skills or categories"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <select
                        className="gig-category-filter"
                        value={selectedCategory}
                        onChange={(event) =>
                            setSelectedCategory(event.target.value)
                        }
                        disabled={Boolean(categoryError)}
                    >
                        <option value="all">
                            All categories
                        </option>

                        {categories.map((category) => (
                            <option
                                key={
                                    category._id ||
                                    category.normalizedName ||
                                    category.name
                                }
                                value={category.name}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="gig-clear-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {categoryError && !errorMessage && (
                <div className="error-message" role="alert">
                    {categoryError}
                </div>
            )}

            {errorMessage && (
                <div className="error-message" role="alert">
                    {errorMessage}
                </div>
            )}

            {!errorMessage && gigs.length === 0 && (
                <div className="empty-state">
                    <p>No gigs are currently available.</p>
                </div>
            )}

            {!errorMessage &&
                gigs.length > 0 &&
                filteredGigs.length === 0 && (
                    <div className="empty-state">
                        <p>
                            No gigs match your search.
                        </p>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                )}

            {!errorMessage && filteredGigs.length > 0 && (
                <div className="gig-grid">
                    {filteredGigs.map((gig) => (
                        <GigCard
                            key={gig.id}
                            gig={gig}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default BrowseGigsPage;

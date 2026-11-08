
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function MyGigsPage() {
    const [gigs, setGigs] = useState([]);
    const [bookedGigIds, setBookedGigIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [gigToDelete, setGigToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load the freelancer's gigs and booking history.
    useEffect(() => {
        const fetchGigs = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const [gigsResponse, bookingsResponse] =
                    await Promise.all([
                        api.get("/gigs/mine"),
                        api.get("/bookings/freelancer")
                    ]);

                setGigs(gigsResponse.data.gigs || []);

                // Any booking history prevents editing,
                // including pending, approved and rejected requests.
                const bookings = bookingsResponse.data.bookings || [];

                const bookedIds = new Set(
                    bookings.map((booking) => booking.gigId)
                );

                setBookedGigIds(bookedIds);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load your gigs and booking information."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchGigs();
    }, []);

    const handleDelete = async () => {
        if (!gigToDelete) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage("");

        try {
            await api.delete(`/gigs/${gigToDelete.id}`);

            setGigs((currentGigs) =>
                currentGigs.filter(
                    (gig) => gig.id !== gigToDelete.id
                )
            );

            setGigToDelete(null);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to delete this gig."
            );

            // Close the confirmation modal so the freelancer
            // can immediately see the error message.
            setGigToDelete(null);
        } finally {
            setIsDeleting(false);
        }
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
            <div className="page-header page-header-row">
                <div>
                    <span className="page-eyebrow">
                        FREELANCER WORKSPACE
                    </span>

                    <h1>My Gigs</h1>

                    <Link
                        to="/freelancer/gigs/create"
                        className="btn btn-primary"
                    >
                        + Create Gig
                    </Link>

                    <br />
                    <br />

                    <p>
                        Manage the freelance services you offer on HustleHub+.
                    </p>
                </div>
            </div>

            {errorMessage && (
                <div className="error-message" role="alert">
                    {errorMessage}
                </div>
            )}

            {!errorMessage && gigs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">+</div>

                    <h3>No gigs yet</h3>

                    <p>
                        Create your first gig to start offering services.
                    </p>
                </div>
            )}

            {gigs.length > 0 && (
                <div className="gig-grid">
                    {gigs.map((gig) => {
                        const hasBookings = bookedGigIds.has(gig.id);

                        return (
                            <article
                                className="gig-card"
                                key={gig.id}
                            >
                                <div className="gig-card-content">
                                    <span className="gig-category">
                                        {gig.category || "General"}
                                    </span>

                                    <h3>
                                        {gig.title || "Untitled Gig"}
                                    </h3>

                                    <p className="gig-description">
                                        {gig.description ||
                                            "No description available."}
                                    </p>

                                    {hasBookings && (
                                        <p
                                            style={{
                                                fontSize: "0.85rem",
                                                marginTop: "10px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            🔒 Editing unavailable —
                                            this gig has booking history.
                                        </p>
                                    )}

                                    <div className="gig-card-footer">
                                        <div className="gig-price-block">
                                            <span className="gig-price-label">
                                                Price
                                            </span>

                                            <span className="gig-price">
                                                R{Number(
                                                    gig.price || 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="gig-card-actions">
                                            {hasBookings ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    disabled
                                                    title="This gig cannot be edited because it has booking history."
                                                    style={{
                                                        opacity: 0.5,
                                                        cursor: "not-allowed"
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            ) : (
                                                <Link
                                                    to={`/freelancer/gigs/${gig.id}/edit`}
                                                    className="btn btn-secondary"
                                                >
                                                    Edit
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    setGigToDelete(gig)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {gigToDelete && (
                <div className="modal-overlay">
                    <div className="delete-modal">
                        <div className="delete-modal-icon">
                            !
                        </div>

                        <h2>Delete Gig?</h2>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {gigToDelete.title || "this gig"}
                            </strong>
                            ? This action cannot be undone.
                        </p>

                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    setGigToDelete(null)
                                }
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-danger-solid"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete Gig"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default MyGigsPage;

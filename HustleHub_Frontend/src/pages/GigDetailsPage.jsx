
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

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

/*
    // Code Attribution:
    // Title: ChatGPT - Booking Request Workflow
    // Author: OpenAI (ChatGPT)
    // Date Accessed: 19 October 2026
    // Version: ChatGPT
    // Availability: https://chatgpt.com/
    // Purpose: Assisted with adapting the gig booking page
    // to the freelancer approval and rejection workflow.
*/

function GigDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [gig, setGig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [isBooking, setIsBooking] = useState(false);
    const [bookingMessage, setBookingMessage] = useState("");

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const response = await api.get(`/gigs/${id}`);
                setGig(response.data.gig);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load gig."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchGig();
    }, [id]);

    const getGigVisual = () => {
        const content =
            `${gig?.category || ""} ${gig?.title || ""}`.toLowerCase();

        if (
            content.includes("design") ||
            content.includes("logo") ||
            content.includes("graphic")
        ) {
            return {
                icon: "✦",
                label: "Creative Design",
                className: "gig-visual-design"
            };
        }

        if (
            content.includes("web") ||
            content.includes("development") ||
            content.includes("developer") ||
            content.includes("coding")
        ) {
            return {
                icon: "</>",
                label: "Web Development",
                className: "gig-visual-development"
            };
        }

        if (
            content.includes("writing") ||
            content.includes("copy") ||
            content.includes("content")
        ) {
            return {
                icon: "Aa",
                label: "Content & Writing",
                className: "gig-visual-writing"
            };
        }

        if (
            content.includes("marketing") ||
            content.includes("social")
        ) {
            return {
                icon: "↗",
                label: "Marketing",
                className: "gig-visual-marketing"
            };
        }

        return {
            icon: "H+",
            label: gig?.category || "Freelance Service",
            className: "gig-visual-default"
        };
    };

    // Submit a booking request.
    // The freelancer must approve it before a transaction
    // is created by the backend.
    const handleBooking = async () => {
        try {
            setIsBooking(true);
            setBookingMessage("");

            await api.post("/bookings", {
                gigId: id
            });

            // The client can view their pending request here.
            navigate("/bookings");
        } catch (error) {
            setBookingMessage(
                error.response?.data?.message ||
                "Unable to submit booking request."
            );
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <main className="page-container">
                <p>Loading gig...</p>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="page-container">
                <div className="error-message">
                    {errorMessage}
                </div>
            </main>
        );
    }

    if (!gig) {
        return (
            <main className="page-container">
                <div className="empty-state">
                    <p>Gig not found.</p>
                </div>
            </main>
        );
    }

    const visual = getGigVisual();

    return (
        <main className="page-container">
            <Link to="/gigs" className="back-link">
                ← Back to Browse Gigs
            </Link>

            <div className="gig-details-layout">
                <section
                    className={`gig-details-visual ${visual.className}`}
                >
                    <span className="gig-details-visual-icon">
                        {visual.icon}
                    </span>

                    <span className="gig-details-visual-label">
                        {visual.label}
                    </span>
                </section>

                <section className="gig-details-card">
                    <span className="gig-category">
                        {gig.category || "General"}
                    </span>

                    <h1>
                        {gig.title || "Untitled Gig"}
                    </h1>

                    <p className="gig-details-description">
                        {gig.description || "No description available."}
                    </p>

                    <div className="gig-details-divider"></div>

                    <div className="gig-details-price">
                        <div>
                            <span>Service price</span>

                            <strong>
                                R{Number(gig.price || 0).toLocaleString()}
                            </strong>
                        </div>

                        <span className="gig-price-note">
                            One-time service request
                        </span>
                    </div>

                    {bookingMessage && (
                        <div className="error-message">
                            {bookingMessage}
                        </div>
                    )}

                    <button
                        type="button"
                        className="btn btn-primary book-button"
                        onClick={handleBooking}
                        disabled={isBooking}
                    >
                        {isBooking
                            ? "Sending Request..."
                            : "Request to Book"}
                    </button>

                    <p className="booking-helper">
                        Your request will be sent to the freelancer
                        for approval. You can track its status under
                        My Bookings. A transaction will only be
                        recorded if the freelancer approves.
                    </p>
                </section>
            </div>
        </main>
    );
}

export default GigDetailsPage;


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

/*
    // Code Attribution:
    // Title: Axios API
    // Author: Axios Contributors
    // Date Accessed: 12 October 2026
    // Version: Axios 1.x
    // Availability: https://axios-http.com/docs/api_intro
    // Purpose: Referenced for sending HTTP requests to the
    // HustleHub+ backend to retrieve client bookings and
    // transaction records and process API responses.
*/

/*
    // Code Attribution:
    // Title: ChatGPT - Client Booking Request Status
    // Author: OpenAI (ChatGPT)
    // Date Accessed: 19 October 2026
    // Version: ChatGPT
    // Availability: https://chatgpt.com/
    // Purpose: Assisted with displaying pending, approved
    // and rejected booking statuses, explaining each status
    // to clients, and refreshing booking information.
*/

function ClientBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Retrieve booking requests belonging to the logged-in client.
    const fetchBookings = async () => {
        try {
            setErrorMessage("");

            const response = await api.get("/bookings/client");

            setBookings(response.data.bookings || []);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to load your bookings."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Allow clients to check whether a freelancer
    // has approved or rejected their booking request.
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await fetchBookings();
        } finally {
            setIsRefreshing(false);
        }
    };

    // Return a helpful explanation for each booking status.
    const getBookingStatusMessage = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "Your booking request has been sent to the freelancer and is awaiting approval.";

            case "approved":
                return "Your booking request has been approved by the freelancer.";

            case "rejected":
                return "The freelancer has declined your booking request. You can browse other available gigs.";

            case "confirmed":
                return "Your booking was confirmed.";

            default:
                return "Your booking request has been recorded.";
        }
    };

    // Display a readable booking status.
    const getBookingStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "Pending Approval";

            case "approved":
                return "Approved";

            case "rejected":
                return "Rejected";

            case "confirmed":
                return "Confirmed";

            default:
                return "Unknown";
        }
    };

    if (isLoading) {
        return (
            <main className="page-container">
                <p>Loading bookings...</p>
            </main>
        );
    }

    return (
        <main className="page-container">

            {/* Page heading */}
            <div className="page-header page-header-row">
                <div>
                    <span className="page-eyebrow">
                        CLIENT WORKSPACE
                    </span>

                    <h1>My Booking Requests</h1>

                    <p>
                        Track your booking requests and see
                        whether freelancers have approved them.
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing
                            ? "Refreshing..."
                            : "Refresh Status"}
                    </button>

                    <Link
                        to="/gigs"
                        className="btn btn-secondary"
                    >
                        Browse more gigs
                    </Link>
                </div>
            </div>


            {/* Error message */}
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}


            {/* Empty state */}
            {!errorMessage && bookings.length === 0 && (
                <div className="empty-state bookings-empty-state">
                    <div className="empty-state-icon">
                        +
                    </div>

                    <h3>No booking requests yet</h3>

                    <p>
                        Browse the marketplace and request
                        your first freelance service.
                    </p>

                    <Link
                        to="/gigs"
                        className="btn btn-primary"
                    >
                        Browse Gigs
                    </Link>
                </div>
            )}


            {/* Booking cards */}
            {bookings.length > 0 && (
                <div className="booking-list">

                    {bookings.map((booking) => (
                        <article
                            className="booking-card"
                            key={booking.id}
                        >

                            {/* Top section */}
                            <div className="booking-card-top">

                                <div className="booking-service">

                                    <div className="booking-icon">
                                        H+
                                    </div>

                                    <div className="booking-info">

                                        <span className="booking-label">
                                            {booking.gigCategory ||
                                                "Freelance Service"}
                                        </span>

                                        <h3>
                                            {booking.gigTitle ||
                                                "Booked Service"}
                                        </h3>

                                        <p>
                                            Requested{" "}
                                            {booking.createdAt
                                                ? new Date(
                                                      booking.createdAt
                                                  ).toLocaleDateString(
                                                      "en-ZA",
                                                      {
                                                          day: "numeric",
                                                          month: "long",
                                                          year: "numeric"
                                                      }
                                                  )
                                                : "—"}
                                        </p>

                                    </div>
                                </div>


                                {/* Booking status */}
                                <span
                                    className={`status-badge status-${booking.status?.toLowerCase()}`}
                                >
                                    {getBookingStatusLabel(booking.status)}
                                </span>

                            </div>


                            {/* Bottom section */}
                            <div className="booking-card-bottom">

                                <div className="booking-detail">
                                    <span>
                                        BOOKING REFERENCE
                                    </span>

                                    <strong>
                                        #{booking.id?.slice(0, 8)}
                                    </strong>
                                </div>

                                <div className="booking-detail booking-price-detail">
                                    <span>
                                        PRICE
                                    </span>

                                    <strong>
                                        R{Number(
                                            booking.price || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>

                            </div>


                            {/* Explain the current booking status */}
                            <div
                                style={{
                                    marginTop: "16px",
                                    paddingTop: "12px",
                                    borderTop: "1px solid #e5e7eb"
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "14px"
                                    }}
                                >
                                    {getBookingStatusMessage(
                                        booking.status
                                    )}
                                </p>

                                {/* Rejected clients can browse other gigs */}
                                {booking.status === "rejected" && (
                                    <Link
                                        to="/gigs"
                                        className="btn btn-secondary"
                                        style={{
                                            marginTop: "12px"
                                        }}
                                    >
                                        Browse Other Gigs
                                    </Link>
                                )}
                            </div>

                        </article>
                    ))}

                </div>
            )}

        </main>
    );
}

export default ClientBookingsPage;

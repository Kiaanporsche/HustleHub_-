
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

/*
    // Code Attribution:
    // Title: ChatGPT - Freelancer Booking Approval and Rejection
    // Author: OpenAI (ChatGPT)
    // Date Accessed: 19 October 2026
    // Version: ChatGPT
    // Availability: https://chatgpt.com/
    // Purpose: Assisted with adding approval and rejection
    // functionality for freelancer booking requests, updating
    // booking statuses in React state, and handling API errors.
*/

function FreelancerBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [processingBookingId, setProcessingBookingId] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get("/bookings/freelancer");
                setBookings(response.data.bookings);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load your bookings."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Approve or reject a pending booking request.
    // Only the freelancer who owns the booking can
    // perform this action, as verified by the backend.
    const handleBookingDecision = async (bookingId, status) => {
        try {
            setProcessingBookingId(bookingId);
            setErrorMessage("");

            const response = await api.patch(
                `/bookings/${bookingId}/status`,
                { status }
            );

            if (response.data.success) {
                // Update the booking in React state so the
                // new status appears without refreshing.
                setBookings((previousBookings) =>
                    previousBookings.map((booking) =>
                        booking.id === bookingId
                            ? {
                                  ...booking,
                                  status: response.data.booking.status
                              }
                            : booking
                    )
                );
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to update the booking request."
            );
        } finally {
            setProcessingBookingId(null);
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
            <div className="page-header page-header-row">
                <div>
                    <span className="page-eyebrow">
                        FREELANCER WORKSPACE
                    </span>

                    <h1>Bookings</h1>

                    <p>
                        Review booking requests from clients
                        and approve or reject them.
                    </p>
                </div>

                <Link
                    to="/gigs"
                    className="btn btn-secondary"
                >
                    Browse Gigs
                </Link>
            </div>

            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

            {bookings.length === 0 && !errorMessage && (
                <div className="empty-state bookings-empty-state">
                    <div className="empty-state-icon">
                        +
                    </div>

                    <h3>No bookings yet</h3>

                    <p>
                        Booking requests for your gigs
                        will appear here.
                    </p>
                </div>
            )}

            {bookings.length > 0 && (
                <div className="booking-list">
                    {bookings.map((booking) => (
                        <article
                            className="booking-card"
                            key={booking.id}
                        >
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

                                <span
                                    className={`status-badge status-${booking.status?.toLowerCase()}`}
                                >
                                    {booking.status || "Confirmed"}
                                </span>
                            </div>

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
                                        BOOKING VALUE
                                    </span>

                                    <strong>
                                        R
                                        {Number(
                                            booking.price || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>
                            </div>

                            {/* Only pending requests can be processed. */}
                            {booking.status === "pending" && (
                                <div
                                    className="booking-actions"
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        marginTop: "16px",
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={
                                            processingBookingId !== null
                                        }
                                        onClick={() =>
                                            handleBookingDecision(
                                                booking.id,
                                                "approved"
                                            )
                                        }
                                    >
                                        {processingBookingId === booking.id
                                            ? "Processing..."
                                            : "Approve Booking"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={
                                            processingBookingId !== null
                                        }
                                        onClick={() =>
                                            handleBookingDecision(
                                                booking.id,
                                                "rejected"
                                            )
                                        }
                                    >
                                        Reject Booking
                                    </button>
                                </div>
                            )}

                            {/* Display a message after a decision. */}
                            {booking.status === "approved" && (
                                <p
                                    style={{
                                        marginTop: "12px"
                                    }}
                                >
                                    This booking has been approved.
                                </p>
                            )}

                            {booking.status === "rejected" && (
                                <p
                                    style={{
                                        marginTop: "12px"
                                    }}
                                >
                                    This booking request was rejected.
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default FreelancerBookingsPage;

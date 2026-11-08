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

function ClientTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get("/transactions/client");
                setTransactions(response.data.transactions);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load your transactions."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const totalSpent = transactions
        .filter(
            (transaction) =>
                transaction.status?.toLowerCase() === "completed"
        )
        .reduce(
            (total, transaction) =>
                total + Number(transaction.amount || 0),
            0
        );

    if (isLoading) {
        return (
            <main className="page-container">
                <p>Loading transactions...</p>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header page-header-row">
                <div>
                    <span className="page-eyebrow">
                        CLIENT WORKSPACE
                    </span>

                    <h1>Transactions</h1>

                    <p>
                        View the payment history for your booked gigs.
                    </p>
                </div>

                <Link
                    to="/gigs"
                    className="btn btn-secondary"
                >
                    Browse more gigs
                </Link>
            </div>

            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

            {!errorMessage && transactions.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        R
                    </div>

                    <h3>No transactions yet</h3>

                    <p>
                        Your transactions will appear here after
                        you book a gig.
                    </p>

                    <Link
                        to="/gigs"
                        className="btn btn-primary"
                    >
                        Browse Gigs
                    </Link>
                </div>
            )}

            {!errorMessage && transactions.length > 0 && (
                <>
                    <div className="transaction-summary">
                        <div>
                            <span className="transaction-summary-label">
                                TOTAL SPENT
                            </span>

                            <strong>
                                R{totalSpent.toLocaleString()}
                            </strong>
                        </div>

                        <div>
                            <span className="transaction-summary-label">
                                TRANSACTIONS
                            </span>

                            <strong>
                                {transactions.length}
                            </strong>
                        </div>
                    </div>

                    <div className="transaction-list">
                        {transactions.map((transaction) => (
                            <article
                                className="transaction-card"
                                key={transaction.id}
                            >
                                <div className="transaction-main">
                                    <div className="transaction-icon">
                                        R
                                    </div>

                                    <div className="transaction-info">
                                        <span className="transaction-label">
                                            {transaction.gigCategory ||
                                                "Freelance Service"}
                                        </span>

                                        <h3>
                                            {transaction.gigTitle ||
                                                "Booked Service"}
                                        </h3>

                                        <p>
                                            {transaction.createdAt
                                                ? new Date(
                                                    transaction.createdAt
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

                                <div className="transaction-meta">
                                    <div className="transaction-reference">
                                        <span>
                                            TRANSACTION REFERENCE
                                        </span>

                                        <strong>
                                            #
                                            {transaction.id?.slice(
                                                0,
                                                8
                                            )}
                                        </strong>
                                    </div>

                                    <div className="transaction-reference">
                                        <span>
                                            AMOUNT
                                        </span>

                                        <strong>
                                            R
                                            {Number(
                                                transaction.amount || 0
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                    <span
                                        className={`status-badge status-${transaction.status?.toLowerCase()}`}
                                    >
                                        {transaction.status ||
                                            "Completed"}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}

export default ClientTransactionsPage;
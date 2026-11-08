import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

/*
    // Code Attribution:
    // Title: useState
    // Author: React Team (Meta)
    // Date Accessed: 12 October 2026
    // Version: React 19
    // Availability: https://react.dev/reference/react/useState
    // Purpose: Referenced for managing registration and login
    // form inputs, validation messages, and loading states
    // in the HustleHub+ authentication pages.
*/

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            login(response.data.user, response.data.token);

            navigate("/gigs");

        
            } catch (error) {
                // Display specific validation messages returned by the backend.
                const validationErrors = error.response?.data?.errors;

                if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                    const messages = validationErrors
                        .map((validationError) =>
                            validationError.msg ||
                            validationError.message
                        )
                        .filter(Boolean)
                        .join(" ");

                    setErrorMessage(
                        messages || "Please check your login details."
                    );
                } else {
                    setErrorMessage(
                        error.response?.data?.message ||
                        "Unable to log in. Please try again."
                    );
                }
            } finally {
                setIsLoading(false);
            }

    };

    return (
        <main className="auth-page">
            <div className="auth-shell">

                <section className="auth-side-panel">
                    <div className="auth-side-brand">
                        <div className="brand-icon">H+</div>
                        <span>HustleHub+</span>
                    </div>

                    <div className="auth-side-content">
                        <span className="auth-eyebrow-light">
                            WORK. YOUR WAY.
                        </span>

                        <h1>
                            The marketplace for
                            <br />
                            ambitious work.
                        </h1>

                        <p>
                            Connect with clients and freelancers in one
                            secure, easy-to-use marketplace.
                        </p>

                        <div className="auth-info-box">
                            HustleHub+ connects clients with independent
                            freelancers to discover, book and manage services.
                        </div>
                    </div>
                </section>

                <section className="auth-form-panel">
                    <div className="auth-form-content">
                        <span className="auth-eyebrow">
                            HUSTLEHUB+ ACCESS
                        </span>

                        <h2>Welcome back</h2>

                        <p className="auth-subtitle">
                            Sign in to continue to your workspace.
                        </p>

                        {errorMessage && (
                            <div className="error-message">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="alex@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary auth-submit-button"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <p className="auth-account-link">
                            Need an account?{" "}
                            <Link to="/register">
                                Create one
                            </Link>
                        </p>
                    </div>
                </section>

            </div>
        </main>
    );
}

export default LoginPage;
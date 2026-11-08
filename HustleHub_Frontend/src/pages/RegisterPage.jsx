import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";


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

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client");

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await api.post("/auth/register", {
                name,
                email,
                password,
                role
            });

            setSuccessMessage(
                response.data.message || "Registration successful."
            );

            // Send the user to login after successful registration
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        
        } catch (error) {
            // Show specific validation errors returned by the backend.
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
                    messages || "Please check your registration details."
                );
            } else {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to register. Please try again."
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
                            Create your HustleHub+ account to discover,
                            book and manage freelance services.
                        </div>
                    </div>
                </section>

                <section className="auth-form-panel">
                    <div className="auth-form-content">
                        <span className="auth-eyebrow">
                            HUSTLEHUB+ ACCESS
                        </span>

                        <h2>Create your account</h2>

                        <p className="auth-subtitle">
                            Join the marketplace as a client or freelancer.
                        </p>

                        {errorMessage && (
                            <div className="error-message">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="success-message">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Alex Morgan"
                                    autoComplete="name"
                                    required
                                />
                            </div>

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
                                    placeholder="Minimum 8 characters"
                                    autoComplete="new-password"
                                    required
                                    minLength="8"
                                />
                            </div>

                            <div className="form-group">
                                <label>Account type</label>

                                <div className="role-options">
                                    <label
                                        className={`role-option ${
                                            role === "client"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="client"
                                            checked={role === "client"}
                                            onChange={(event) =>
                                                setRole(event.target.value)
                                            }
                                        />

                                        <span>Client</span>
                                    </label>

                                    <label
                                        className={`role-option ${
                                            role === "freelancer"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="freelancer"
                                            checked={role === "freelancer"}
                                            onChange={(event) =>
                                                setRole(event.target.value)
                                            }
                                        />

                                        <span>Freelancer</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary auth-submit-button"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <p className="auth-account-link">
                            Already have an account?{" "}
                            <Link to="/login">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>

            </div>
        </main>
    );
}

export default RegisterPage;
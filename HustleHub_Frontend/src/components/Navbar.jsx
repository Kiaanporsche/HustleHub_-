import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import api from "../services/api";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    if (!user) {
        return null;
    }

    
    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setLogoutError("");

        try {
            // Revoke the JWT on the backend before
            // removing it from local storage.
            await api.post("/auth/logout");

            // Clear local authentication state.
            logout();

            // Redirect to the login page.
            navigate("/login", { replace: true });

        } catch (error) {
            // Do not claim secure logout succeeded
            // when the backend could not revoke the JWT.
            setLogoutError(
                "Secure sign out failed. Please try again."
            );

            setIsLoggingOut(false);
        }
    };


    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="sidebar-brand">
                    <div className="brand-icon">H+</div>
                    <span>HustleHub+</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/gigs"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="sidebar-icon">⌕</span>
                        Browse gigs
                    </NavLink>

                    {user.role === "client" && (
                        <>
                            <NavLink
                                to="/bookings"
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <span className="sidebar-icon">▣</span>
                                Booked gigs
                            </NavLink>

                            <NavLink
                                to="/transactions"
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <span className="sidebar-icon">▤</span>
                                Transactions
                            </NavLink>
                        </>
                    )}

                    {user.role === "freelancer" && (
                        <>
                            <NavLink
                                to="/freelancer/gigs"
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <span className="sidebar-icon">▦</span>
                                My Gigs
                            </NavLink>
                            <NavLink
                                to="/freelancer/bookings"
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <span className="sidebar-icon">▣</span>
                                Bookings
                            </NavLink>

                            <NavLink
                                to="/freelancer/income"
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <span className="sidebar-icon">▤</span>
                                Income
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
            
        <div>
            <button
                type="button"
                className="sidebar-logout"
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>

            {logoutError && (
                <p
                    role="alert"
                    style={{
                        color: "#ffb4b4",
                        fontSize: "12px",
                        marginTop: "8px"
                    }}
                >
                    {logoutError}
                </p>
            )}
        </div>

        </aside>
    );
}

export default Navbar;


// Code Attribution:
// Title: Axios API and React useState
// Author: Axios Contributors and React Team (Meta)
// Date Accessed: 7 November 2026
// Version: Project-installed versions
// Availability:
// https://axios-http.com/docs/api_intro
// https://react.dev/reference/react/useState
// Purpose: Referenced for implementing asynchronous
// secure logout requests, managing logout state,
// and handling errors in the React navigation.


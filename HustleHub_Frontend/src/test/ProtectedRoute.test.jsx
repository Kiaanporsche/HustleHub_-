
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Mock the authentication context
vi.mock("../context/AuthContext.jsx", () => ({
    useAuth: vi.fn()
}));

// Render a protected Freelancer page with test routes
function renderProtectedRoute() {
    return render(
        <MemoryRouter initialEntries={["/freelancer/income"]}>
            <Routes>
                <Route
                    path="/login"
                    element={<h1>Login Page</h1>}
                />

                <Route
                    path="/gigs"
                    element={<h1>Browse Gigs Page</h1>}
                />

                <Route
                    path="/freelancer/income"
                    element={
                        <ProtectedRoute allowedRoles={["freelancer"]}>
                            <h1>Freelancer Income Page</h1>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
}

describe("ProtectedRoute Component", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test 1: Users must be logged in
    it("redirects unauthenticated users to login", () => {
        useAuth.mockReturnValue({
            user: null,
            isAuthenticated: false
        });

        renderProtectedRoute();

        expect(
            screen.getByText("Login Page")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Freelancer Income Page")
        ).not.toBeInTheDocument();
    });

    // Test 2: Clients cannot access Freelancer-only pages
    it("blocks clients from accessing freelancer pages", () => {
        useAuth.mockReturnValue({
            user: { id: "client-123", role: "client" },
            isAuthenticated: true
        });

        renderProtectedRoute();

        expect(
            screen.getByText("Browse Gigs Page")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Freelancer Income Page")
        ).not.toBeInTheDocument();
    });

    // Test 3: Freelancers can access their own pages
    it("allows freelancers to access freelancer pages", () => {
        useAuth.mockReturnValue({
            user: { id: "freelancer-123", role: "freelancer" },
            isAuthenticated: true
        });

        renderProtectedRoute();

        expect(
            screen.getByText("Freelancer Income Page")
        ).toBeInTheDocument();
    });
});

/*
    // Code Attribution:
    // Title: Mocking Modules
    // Author: Vitest Team
    // Date Accessed: 11 October 2026
    // Version: Vitest (project-installed version)
    // Availability: https://vitest.dev/guide/mocking/modules
    // Purpose: Referenced for mocking the authentication context
    // using vi.mock() and vi.fn() to simulate authenticated
    // and unauthenticated users during role-based access tests.
*/

/*
    // Code Attribution:
    // Title: MemoryRouter
    // Author: React Router Team
    // Date Accessed: 11 October 2026
    // Version: React Router (project-installed version)
    // Availability: https://reactrouter.com/api/declarative-routers/MemoryRouter
    // Purpose: Referenced for testing protected navigation
    // routes and verifying that users are redirected
    // appropriately based on authentication status and role.
*/
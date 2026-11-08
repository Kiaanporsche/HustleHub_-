
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/LoginPage.jsx";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

// Mock API requests so tests do not require a running backend
vi.mock("../services/api", () => ({
    default: {
        post: vi.fn()
    }
}));

// Mock authentication context
vi.mock("../context/AuthContext.jsx", () => ({
    useAuth: vi.fn()
}));

const mockLogin = vi.fn();

// Render the Login page with test routes
function renderLoginPage() {
    return render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/gigs"
                    element={<h1>Browse Gigs Page</h1>}
                />
            </Routes>
        </MemoryRouter>
    );
}

describe("LoginPage Component", () => {

    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({
            login: mockLogin
        });
    });

    // Test 1: Login form renders correctly
    it("displays the login form", () => {
        renderLoginPage();

        expect(
            screen.getByRole("heading", { name: "Welcome back" })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Email address")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Password")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Sign in" })
        ).toBeInTheDocument();
    });

    // Test 2: Successful login
    it("logs in and redirects when credentials are valid", async () => {
        const user = userEvent.setup();

        const testUser = {
            id: "client-123",
            email: "client@example.com",
            role: "client"
        };

        api.post.mockResolvedValue({
            data: {
                user: testUser,
                token: "test-jwt-token"
            }
        });

        renderLoginPage();

        await user.type(
            screen.getByLabelText("Email address"),
            "client@example.com"
        );

        await user.type(
            screen.getByLabelText("Password"),
            "Password123"
        );

        await user.click(
            screen.getByRole("button", { name: "Sign in" })
        );

        expect(api.post).toHaveBeenCalledWith("/auth/login", {
            email: "client@example.com",
            password: "Password123"
        });

        expect(
            await screen.findByText("Browse Gigs Page")
        ).toBeInTheDocument();

        expect(mockLogin).toHaveBeenCalledWith(
            testUser,
            "test-jwt-token"
        );
    });

    // Test 3: Failed login
    it("displays an error when credentials are incorrect", async () => {
        const user = userEvent.setup();

        api.post.mockRejectedValue({
            response: {
                data: {
                    message: "Invalid credentials."
                }
            }
        });

        renderLoginPage();

        await user.type(
            screen.getByLabelText("Email address"),
            "client@example.com"
        );

        await user.type(
            screen.getByLabelText("Password"),
            "WrongPassword123"
        );

        await user.click(
            screen.getByRole("button", { name: "Sign in" })
        );

        expect(
            await screen.findByText("Invalid credentials.")
        ).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
    });
});

/*
    // Code Attribution:
    // Title: React Testing Library
    // Author: Testing Library Contributors
    // Date Accessed: 11 October 2026
    // Version: React Testing Library (project-installed version)
    // Availability: https://testing-library.com/docs/react-testing-library/intro/
    // Purpose: Referenced for rendering the HustleHub+ Login
    // component and verifying the presence of form fields,
    // buttons, and authentication error messages.
*/

/*
    // Code Attribution:
    // Title: Introduction to user-event
    // Author: Testing Library Contributors
    // Date Accessed: 11 October 2026
    // Version: user-event (project-installed version)
    // Availability: https://testing-library.com/docs/user-event/intro/
    // Purpose: Referenced for simulating user interactions,
    // including entering email addresses, typing passwords,
    // and submitting the login form.
*/

/*
    // Code Attribution:
    // Title: Mocking Modules
    // Author: Vitest Team
    // Date Accessed: 11 October 2026
    // Version: Vitest (project-installed version)
    // Availability: https://vitest.dev/guide/mocking/modules
    // Purpose: Referenced for mocking API responses and
    // authentication functions to test successful and
    // unsuccessful login scenarios without a live backend.
*/
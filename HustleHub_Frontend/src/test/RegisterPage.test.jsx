
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import RegisterPage from "../pages/RegisterPage.jsx";
import api from "../services/api";

// Mock backend API requests
vi.mock("../services/api", () => ({
    default: {
        post: vi.fn()
    }
}));

// Render the registration page
function renderRegisterPage() {
    return render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );
}

// Fill in the registration form
async function fillRegistrationForm(user) {
    await user.type(
        screen.getByLabelText("Full name"),
        "Test User"
    );

    await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com"
    );

    await user.type(
        screen.getByLabelText("Password"),
        "Testing123"
    );
}

describe("RegisterPage Component", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test 1: Verify registration fields
    it("displays the registration form correctly", () => {
        renderRegisterPage();

        expect(
            screen.getByRole("heading", {
                name: "Create your account"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Full name")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Email address")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Password")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Create account"
            })
        ).toBeInTheDocument();
    });

    // Test 2: Verify Client and Freelancer selection
    it("allows the user to select an account role", async () => {
        const user = userEvent.setup();

        renderRegisterPage();

        const clientOption = screen.getByRole("radio", {
            name: "Client"
        });

        const freelancerOption = screen.getByRole("radio", {
            name: "Freelancer"
        });

        // Client should be selected by default
        expect(clientOption).toBeChecked();

        // Change the account type to Freelancer
        await user.click(freelancerOption);

        expect(freelancerOption).toBeChecked();
        expect(clientOption).not.toBeChecked();
    });

    // Test 3: Successful registration
    it("submits valid registration details successfully", async () => {
        const user = userEvent.setup();

        api.post.mockResolvedValue({
            data: {
                success: true,
                message: "Registration successful."
            }
        });

        renderRegisterPage();

        await fillRegistrationForm(user);

        // Submit the registration form
        await user.click(
            screen.getByRole("button", {
                name: "Create account"
            })
        );

        // Verify the correct request was sent
        expect(api.post).toHaveBeenCalledWith(
            "/auth/register",
            {
                name: "Test User",
                email: "test@example.com",
                password: "Testing123",
                role: "client"
            }
        );

        // Verify the success message
        expect(
            await screen.findByText("Registration successful.")
        ).toBeInTheDocument();
    });

    // Test 4: Registration validation errors
    it("displays validation errors returned by the API", async () => {
        const user = userEvent.setup();

        api.post.mockRejectedValue({
            response: {
                data: {
                    success: false,
                    errors: [
                        {
                            field: "password",
                            message:
                                "Password must contain an uppercase letter."
                        }
                    ]
                }
            }
        });

        renderRegisterPage();

        await fillRegistrationForm(user);

        await user.click(
            screen.getByRole("button", {
                name: "Create account"
            })
        );

        // Check that the backend validation message appears
        expect(
            await screen.findByText(
                "Password must contain an uppercase letter."
            )
        ).toBeInTheDocument();
    });
});

/*
    // Code Attribution:
    // Title: React Testing Library
    // Author: Testing Library Contributors
    // Date Accessed: 11 October 2026
    // Version: React Testing Library (project-installed version)
    // Availability: https://testing-library.com/docs/react-testing-library/intro/
    // Purpose: Referenced for rendering the HustleHub+
    // Registration component and verifying that required
    // input fields, role options, and validation messages
    // are displayed correctly.
*/

/*
    // Code Attribution:
    // Title: Introduction to user-event
    // Author: Testing Library Contributors
    // Date Accessed: 11 October 2026
    // Version: user-event (project-installed version)
    // Availability: https://testing-library.com/docs/user-event/intro/
    // Purpose: Referenced for simulating registration form
    // interactions, including entering user information,
    // selecting Client or Freelancer roles, and submitting
    // registration details.
*/

/*
    // Code Attribution:
    // Title: Mocking Modules
    // Author: Vitest Team
    // Date Accessed: 11 October 2026
    // Version: Vitest (project-installed version)
    // Availability: https://vitest.dev/guide/mocking/modules
    // Purpose: Referenced for mocking registration API
    // responses to verify successful submissions and
    // appropriate handling of backend validation errors.
*/
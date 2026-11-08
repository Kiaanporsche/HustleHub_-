
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GigCard from "../components/GigCard.jsx";

describe("GigCard Component", () => {

    // Test 1: Check that gig information displays correctly
    it("displays the correct gig information", () => {

        const gig = {
            id: "gig-123",
            title: "Professional Logo Design",
            description: "I create custom logos for businesses.",
            category: "Graphic Design",
            price: 600
        };

        render(
            <MemoryRouter>
                <GigCard gig={gig} />
            </MemoryRouter>
        );

        // Verify that the gig title is displayed
        expect(
            screen.getByRole("heading", {
                name: "Professional Logo Design"
            })
        ).toBeInTheDocument();

        // Verify the description
        expect(
            screen.getByText("I create custom logos for businesses.")
        ).toBeInTheDocument();

        // Verify the category
        expect(
            screen.getByText("Graphic Design")
        ).toBeInTheDocument();

        // Verify the price
        expect(
            screen.getByText("R600")
        ).toBeInTheDocument();

        // Verify the gig details link
        expect(
            screen.getByRole("link", { name: /view gig/i })
        ).toHaveAttribute("href", "/gigs/gig-123");
    });

    // Test 2: Check fallback values when gig information is missing
    it("displays default values for missing gig information", () => {

        const gig = {
            id: "gig-456"
        };

        render(
            <MemoryRouter>
                <GigCard gig={gig} />
            </MemoryRouter>
        );

        expect(
            screen.getByText("Untitled Gig")
        ).toBeInTheDocument();

        expect(
            screen.getByText("No description available.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("General")
        ).toBeInTheDocument();

        expect(
            screen.getByText("R0")
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
    // Purpose: Referenced for rendering the HustleHub+ GigCard
    // component and verifying that gig details, including
    // titles, descriptions, categories, and prices, are displayed.
*/

/*
    // Code Attribution:
    // Title: MemoryRouter
    // Author: React Router Team
    // Date Accessed: 11 October 2026
    // Version: React Router (project-installed version)
    // Availability: https://reactrouter.com/api/declarative-routers/MemoryRouter
    // Purpose: Referenced for rendering GigCard components
    // containing navigation links within a simulated routing
    // environment during automated testing.
*/
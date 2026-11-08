
// Code attribution
// Title: Writing Tests - Playwright
// Available at: https://playwright.dev/docs/writing-tests
// Date accessed: 7 November 2026

// Code attribution
// Title: Assertions - Playwright
// Available at: https://playwright.dev/docs/test-assertions
// Date accessed: 7 November 2026

// Code attribution
// Title: Locators - Playwright
// Available at: https://playwright.dev/docs/locators
// Date accessed: 7 November 2026

// AI Code Attribution
// AI Tool: ChatGPT (OpenAI)
// Purpose: Assistance with developing Playwright end-to-end tests
// AI conversation: https://chatgpt.com/share/6aeeb699-4020-83e9-8383-f635c27b0acb
// Date accessed: 7 November 2026



// End to end tests for the freelancer Financial Dashboard

const { test, expect } = require("@playwright/test");
const {
    createApi,
    registerAndLogin,
    seedFreelancerWithEarnings,
    loginAs,
    PASSWORD
} = require("../helpers/api");

// The dashboard formats money with toLocaleString ,which would be  R400000.


const parseRand = (text) => Number(text.replace(/\D/g, "")) / 100;

// Reads the value shown on one of the four summary cards.
const cardValue = (page, label) =>
    page
        .locator(".financial-summary-card", { hasText: label })
        .locator(".financial-summary-value");

// Keeps re-reading the card until it shows the expected number. Each read gives
// up after 1 second, so a missing card fails fast instead of hanging.
const expectCard = async (page, label, expected) => {
    await expect
        .poll(
            async () =>
                parseRand(await cardValue(page, label).innerText({ timeout: 1000 })),
            { timeout: 10_000 }
        )
        .toBe(expected);
};

const PRICES = [1500, 2500];
const EXPECTED_TOTAL = 4000;

let api;
let earner; // freelancer who has two approved bookings R4000 total

test.beforeAll(async () => {
    api = await createApi();
    earner = await seedFreelancerWithEarnings(api, PRICES);
});

test.afterAll(async () => {
    await api.dispose();
});

test.describe("Financial dashboard - freelancer with earnings", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, earner.freelancer);
        await page.goto("/freelancer/income");
        await expect(
            page.getByRole("heading", { name: "Financial Dashboard" })
        ).toBeVisible();
    });

    test("shows earnings from approved bookings in the summary cards", async ({
        page
    }) => {
        await expectCard(page, "Total Earnings", EXPECTED_TOTAL);
        await expectCard(page, /Tax Year \d{4} Earnings/, EXPECTED_TOTAL);

        await expect(
            page.getByText(`${PRICES.length} completed transactions this tax year`)
        ).toBeVisible();
    });

    test("tax estimator recalculates when income and expenses are entered", async ({
        page
    }) => {
        // R4000 recorded + R296000 additional = R300000 taxable.
        await page.locator("#additionalIncome").fill("296000");
        await expectCard(page, "Estimated Taxable Income", 300000);
        await expectCard(page, "Estimated Annual Tax", 40572);

        // R20000 of deductible expenses lowers taxable income to R280000.
        await page.locator("#deductibleExpenses").fill("20000");
        await expectCard(page, "Estimated Taxable Income", 280000);
        await expectCard(page, "Estimated Annual Tax", 35372);
    });

    test("renders both charts when there is data", async ({ page }) => {
        await expect(
            page.getByRole("heading", { name: "Monthly Earnings" })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "Estimated Income Breakdown" })
        ).toBeVisible();

        await expect(
            page.locator(".financial-chart-container .recharts-wrapper")
        ).toHaveCount(2);
        await expect(page.locator(".financial-chart-empty")).toHaveCount(0);
    });

    test("is reachable from the sidebar Income link", async ({ page }) => {
        await page.goto("/gigs");
        await page.getByRole("link", { name: "Income" }).click();

        await expect(page).toHaveURL(/\/freelancer\/income$/);
        await expect(
            page.getByRole("heading", { name: "Financial Dashboard" })
        ).toBeVisible();
    });
});

test.describe("Financial dashboard - new freelancer with no earnings", () => {
    test("shows zero earnings, empty states, then a breakdown once income is entered", async ({
        page
    }) => {
        const newcomer = await registerAndLogin(api, "freelancer");
        await loginAs(page, newcomer);
        await page.goto("/freelancer/income");

        await expectCard(page, "Total Earnings", 0);
        await expect(
            page.getByText("No completed transactions recorded for this tax year yet.")
        ).toBeVisible();
        await expect(
            page.getByText("Enter annual income to see your estimated financial breakdown.")
        ).toBeVisible();

        // R100000 additional income and then R180 tax and the pie chart appears.
        await page.locator("#additionalIncome").fill("100000");
        await expectCard(page, "Estimated Annual Tax", 180);
        await expect(
            page.getByText("Enter annual income to see your estimated financial breakdown.")
        ).toHaveCount(0);
    });
});

test.describe("Financial dashboard - access control", () => {
    test("a logged-out visitor is sent to the login page", async ({ page }) => {
        await page.goto("/freelancer/income");
        await expect(page).toHaveURL(/\/login$/);
    });

    test("a client cannot open the freelancer dashboard", async ({ page }) => {
        await loginAs(page, earner.client);
        await page.goto("/freelancer/income");

        // ProtectedRoute redirects the wrong role to gigs.
        await expect(page).toHaveURL(/\/gigs$/);
        await expect(
            page.getByRole("heading", { name: "Financial Dashboard" })
        ).toHaveCount(0);
    });

    test("a freelancer can sign in through the real login form and reach the dashboard", async ({
        page
    }) => {
        await page.goto("/login");
        await page.locator("#email").fill(earner.freelancer.email);
        await page.locator("#password").fill(PASSWORD);
        await page.locator('button[type="submit"]').click();

        await expect(page).toHaveURL(/\/gigs$/);

        await page.getByRole("link", { name: "Income" }).click();
        await expectCard(page, "Total Earnings", EXPECTED_TOTAL);
    });
});
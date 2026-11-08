// Code attribution
// Title: API Testing - Playwright
// Available at: https://playwright.dev/docs/api-testing
// Date accessed: 7 November 2026

// AI Code Attribution
// AI Tool: ChatGPT (OpenAI)
// Purpose: Assistance with Playwright API testing
// AI conversation: https://chatgpt.com/share/6aeeb699-4020-83e9-8383-f635c27b0acb
// Date accessed: 7 November 2026

// Helpers that create test data through the real backend API.

const crypto = require("crypto");
const { request } = require("@playwright/test");

const API_URL = process.env.API_URL || "https://localhost:3000/api";

// Meets the password rules: 8+ chars, upper, lower and a digit.
const PASSWORD = "Passw0rd!Test";

// Unique per user, so the tests can be re-run against the same database.
// The random suffix keeps two runs that start in the same millisecond apart.
const uniqueEmail = (prefix) =>
    `${prefix}.${Date.now()}.${crypto.randomBytes(3).toString("hex")}@e2e.hustlehub.test`;

// APIRequestContext that accepts the self-signed certificate.
const createApi = () => request.newContext({ ignoreHTTPSErrors: true });

// Fail loudly, with the server's answer, if a setup call does not succeed.
async function expectOk(response, description) {
    if (!response.ok()) {
        throw new Error(
            `${description} failed: ${response.status()} ${await response.text()}`
        );
    }
    return response.json();
}

// Register a user, log in, and return everything a test needs.

async function registerAndLogin(api, role) {
    const email = uniqueEmail(role);
    const name = role === "freelancer" ? "Test Freelancer" : "Test Client";

    await expectOk(
        await api.post(`${API_URL}/auth/register`, {
            data: { name, email, password: PASSWORD, role }
        }),
        `Register ${role}`
    );

    const login = await expectOk(
        await api.post(`${API_URL}/auth/login`, {
            data: { email, password: PASSWORD }
        }),
        `Login ${role}`
    );

    return { email, password: PASSWORD, token: login.token, user: login.user };
}

const authHeader = (session) => ({ Authorization: `Bearer ${session.token}` });

async function createGig(api, freelancer, { title, price }) {
    const body = await expectOk(
        await api.post(`${API_URL}/gigs`, {
            headers: authHeader(freelancer),
            data: {
                title,
                description: "Gig created by the automated Playwright tests.",
                category: "Design",
                price
            }
        }),
        "Create gig"
    );
    return body.gig;
}

async function bookGig(api, client, gigId) {
    const body = await expectOk(
        await api.post(`${API_URL}/bookings`, {
            headers: authHeader(client),
            data: { gigId }
        }),
        "Create booking"
    );
    return body.booking;
}

async function approveBooking(api, freelancer, bookingId) {
    return expectOk(
        await api.patch(`${API_URL}/bookings/${bookingId}/status`, {
            headers: authHeader(freelancer),
            data: { status: "approved" }
        }),
        "Approve booking"
    );
}

// Creates a freelancer and a client, then one gig, then booking and then approval for
// each price. Approval is what creates the completed transaction.
async function seedFreelancerWithEarnings(api, prices) {
    const freelancer = await registerAndLogin(api, "freelancer");
    const client = await registerAndLogin(api, "client");

    for (const [index, price] of prices.entries()) {
        const gig = await createGig(api, freelancer, {
            title: `Playwright Gig ${index + 1}`,
            price
        });
        const booking = await bookGig(api, client, gig.id);
        await approveBooking(api, freelancer, booking.id);
    }

    return {
        freelancer,
        client,
        total: prices.reduce((sum, price) => sum + price, 0)
    };
}

// The app keeps its login in localStorage. Setting it before the page loads
// puts the browser in a "logged in" state without typing into the form.
async function loginAs(page, session) {
    await page.addInitScript(
        ([token, user]) => {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
        },
        [session.token, session.user]
    );
}

module.exports = {
    createApi,
    registerAndLogin,
    seedFreelancerWithEarnings,
    loginAs,
    PASSWORD
};
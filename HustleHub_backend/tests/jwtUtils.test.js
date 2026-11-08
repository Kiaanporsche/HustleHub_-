// Code attribution
// Title: Test Runner - Node.js
// Available at: https://nodejs.org/api/test.html
// Date accessed: 7 November 2026

// Code attribution
// Title: Assertion Testing - Node.js
// Available at: https://nodejs.org/api/assert.html
// Date accessed: 7 November 2026


// Use a test only secret before importing jwtUtils
process.env.JWT_SECRET = "unit-test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const { generateToken } = require("../utils/jwtUtils");

// tests the token is generated successfully
test("generateToken returns a JWT string", () => {
    const token = generateToken({
        id: "user-123",
        role: "freelancer"
    });

    assert.equal(typeof token, "string");
    assert.ok(token.length > 0);
});

// this tests that the token contains the correct user ID and role
test("generateToken includes the correct user ID and role", () => {
    const token = generateToken({
        id: "user-123",
        role: "freelancer"
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    assert.equal(decoded.userId, "user-123");
    assert.equal(decoded.role, "freelancer");
});

// Tests the token expires after one hour
test("generateToken sets a one-hour expiry", () => {
    const token = generateToken({
        id: "user-123",
        role: "client"
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    assert.equal(decoded.exp - decoded.iat, 3600);
});
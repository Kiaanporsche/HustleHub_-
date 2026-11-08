// Code attribution
// Title: Test Runner for Node.js
// Available at: https://nodejs.org/api/test.html
// Date accessed: 7 November 2026

// Code attribution
// Title: Assertion Testing for Node.js
// Available at: https://nodejs.org/api/assert.html
// Date accessed: 7 November 2026

// Code attribution
// Title: Express Validator 
// Available at: https://express-validator.github.io/docs/
// Date accessed: 7 November 2026

const test = require("node:test");
const assert = require("node:assert/strict");

const { validationResult } = require("express-validator");

const {
    registerValidation,
    loginValidation,
    gigValidation,
    bookingValidation
} = require("../middleware/validationMiddleware");

// Helper function to run validation rules
const runValidation = async (validationRules, body) => {
    const req = { body };

    for (const validation of validationRules) {
        await validation.run(req);
    }

    return validationResult(req).array();
};


// Registration validation tests


// Valid registration details
test("Registration accepts valid user details", async () => {
    const errors = await runValidation(registerValidation, {
        name: "John Smith",
        email: "john@example.com",
        password: "Password123",
        role: "client"
    });

    assert.equal(errors.length, 0);
});

// Test 5: Invalid email is rejected
test("Registration rejects an invalid email", async () => {
    const errors = await runValidation(registerValidation, {
        name: "John Smith",
        email: "invalid-email",
        password: "Password123",
        role: "client"
    });

    assert.ok(errors.length > 0);
});

//  Weak password is rejected
test("Registration rejects a password without the required complexity", async () => {
    const errors = await runValidation(registerValidation, {
        name: "John Smith",
        email: "john@example.com",
        password: "password",
        role: "client"
    });

    assert.ok(errors.length > 0);
});

//  Invalid user role is rejected
test("Registration rejects an invalid user role", async () => {
    const errors = await runValidation(registerValidation, {
        name: "John Smith",
        email: "john@example.com",
        password: "Password123",
        role: "admin"
    });

    assert.ok(errors.length > 0);
});


// Login validation tests


// Valid login details
test("Login accepts valid email and password", async () => {
    const errors = await runValidation(loginValidation, {
        email: "john@example.com",
        password: "Password123"
    });

    assert.equal(errors.length, 0);
});

// Invalid login email
test("Login rejects an invalid email", async () => {
    const errors = await runValidation(loginValidation, {
        email: "not-an-email",
        password: "Password123"
    });

    assert.ok(errors.length > 0);
});


// Gig validation tests


// Valid gig details
test("Gig validation accepts valid gig details", async () => {
    const errors = await runValidation(gigValidation, {
        title: "Website Development",
        description: "I provide professional website development services.",
        category: "Development",
        price: 500
    });

    assert.equal(errors.length, 0);
});

// Invalid gig price
test("Gig validation rejects a negative price", async () => {
    const errors = await runValidation(gigValidation, {
        title: "Website Development",
        description: "I provide professional website development services.",
        category: "Development",
        price: -100
    });

    assert.ok(errors.length > 0);
});

// Invalid HTML markup in gig title
test("Gig validation rejects HTML markup in the title", async () => {
    const errors = await runValidation(gigValidation, {
        title: "<script>alert('test')</script>",
        description: "I provide professional website development services.",
        category: "Development",
        price: 500
    });

    assert.ok(errors.length > 0);
});


// Booking validation tests

// Valid booking gig ID
test("Booking validation accepts a valid UUID", async () => {
    const errors = await runValidation(bookingValidation, {
        gigId: "2392499b-05fe-4901-8874-e8c5d111276b"
    });

    assert.equal(errors.length, 0);
});

// Invalid booking gig ID
test("Booking validation rejects an invalid gig ID", async () => {
    const errors = await runValidation(bookingValidation, {
        gigId: "invalid-gig-id"
    });

    assert.ok(errors.length > 0);
});
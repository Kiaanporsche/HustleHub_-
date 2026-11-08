

// Code attribution
// Title: Playwright Test Configuration
// Available at: https://playwright.dev/docs/test-configuration
// Date accessed: 7 November 2026

// AI Code Attribution
// AI Tool: ChatGPT (OpenAI)
// Purpose: Assistance with Playwright configuration,Chromium setup, test reporting, and CI/CD integration.
// AI conversation: https://chatgpt.com/share/6aeeb699-4020-83e9-8383-f635c27b0acb
// Date accessed: 7 November 2026


const { defineConfig, devices } = require("@playwright/test");

const FRONTEND_URL = "http://localhost:5173";

module.exports = defineConfig({
    testDir: "./tests",

    fullyParallel: false,
    workers: 1,

    retries: process.env.CI ? 1 : 0,

    reporter: process.env.CI
        ? [
              ["list"],
              ["html", { open: "never" }],
              ["junit", { outputFile: "results/playwright-results.xml" }]
          ]
        : [["list"], ["html", { open: "never" }]],

    use: {
        baseURL: FRONTEND_URL,
        ignoreHTTPSErrors: true,
        trace: "retain-on-failure",
        screenshot: "only-on-failure"
    },

   projects: [
    {
        name: "chromium",
        use: {
            ...devices["Desktop Chrome"],
            channel: "chromium"
        }
    }
],

    webServer: {
        command: "npm run preview -- --port 5173 --strictPort",
        cwd: "../HustleHub_Frontend",
        url: FRONTEND_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000
    }
});

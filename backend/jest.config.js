module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js",
        "!src/config/**"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    verbose: true,
    setupFilesAfterEnv: ["./tests/setup.js"],
    testTimeout: 10000,
    transformIgnorePatterns: [
        "/node_modules/(?!(.*\\.mjs$))"
    ],
    moduleNameMapper: {
        "^@prisma/client$": "<rootDir>/node_modules/.prisma/client"
    }
};
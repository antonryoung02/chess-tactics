module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@tactics/(.*)$": "<rootDir>/src/tactics/$1",
        "^@utils/(.*)$": "<rootDir>/src/utils/$1",
        "^@types$": "<rootDir>/src/types",
    },
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    clearMocks: true,
    verbose: true,
};

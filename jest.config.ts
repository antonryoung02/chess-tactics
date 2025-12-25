module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@tactics": "<rootDir>/src/tactics/index",
        "^@utils": "<rootDir>/src/utils/index",
        "^@types$": "<rootDir>/src/types",
    },
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    clearMocks: true,
    verbose: true,
};

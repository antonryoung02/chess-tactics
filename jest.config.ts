module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@tactics$": "<rootDir>/src/tactics",
        "^@utils$": "<rootDir>/src/utils",
        "^@types$": "<rootDir>/src/types",
        "^@chess-tactics": "<rootDir>/src",
        "^tests/(.*)$": "<rootDir>/tests/$1",
    },
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    clearMocks: true,
    verbose: true,
    coveragePathIgnorePatterns: ["<rootDir>/tests/", "<rootDir>/node_modules/"],
};

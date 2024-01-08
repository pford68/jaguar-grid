module.exports = {
    modulePaths: ["<rootDir>"],
    preset: "ts-jest",
    transform: {
        "\\.[js|jsx]$": "babel-jest",
        '\\.[ts|tsx]$': 'ts-jest',
    },
    moduleDirectories: ["node_modules"],
    testEnvironment: "node",
    testMatch: [ "**/__tests__/**/*.[jt]s?(x)"],
    testPathIgnorePatterns: ["__mocks__"],
    moduleNameMapper: {
        "\\.(css|less)$": "<rootDir>/tests/__mocks__/MockStyle.js",
        "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/tests/__mocks__/MockImage.js",
    },
    roots: ["<rootDir>/src/js"]
};

module.exports = {
    collectCoverage: true,
    testPathIgnorePatterns: [
        '/node_modules/',
        '/__snapshots__/',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
    ],
    moduleDirectories: ['node_modules', 'src'],
    setupFiles: [
        'raf/polyfill',
        '<rootDir>/internals/testing/enzyme-setup.js',
    ],
    testRegex: 'tests/.*\\.test\\.js$',
    testURL: 'http://localhost/',
    snapshotSerializers: [],
};


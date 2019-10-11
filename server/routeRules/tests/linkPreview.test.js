const fetch = require('node-fetch');
const linkPreview = require('../linkPreview');
jest.mock('node-fetch', () => jest.fn());

const mockRequest = (scheme, host, port, headers = {}, path = '/') => {
    const internalHeaders = Object.assign({}, headers);

    if (port) {
        internalHeaders.Host = `${host}:${port}`;
    } else {
        internalHeaders.Host = host;
    }

    return {
        protocol: scheme,
        hostname: host,
        path,
        originalUrl: path,
        internalHeaders,
        headers: {
            host: internalHeaders.Host,
        },
        get: hdr => internalHeaders[hdr],
    };
};

const mockFetch = (url, data) => {
    let res = null;

    if (data) {
        res = { ok: true, status: 200, json: async () => Promise.resolve(data) };
    }

    fetch.mockImplementation(() => Promise.resolve(res));
};

describe('linkPreview.js', () => {
    describe('normalizeDescription', () => {
        let text;
        let result;

        it('should return the text as is if there is no whitespace to collapse', () => {
            text = 'Simple text';

            result = linkPreview.fn.normalizeDescription(text);

            expect(result).toBe('Simple text');
        });

        it('should return the collapsed text if there are whitespaces to collapse', () => {
            text = 'Simple    \n\n   text \r\n  \r\n  again  \n\n  ';

            result = linkPreview.fn.normalizeDescription(text);

            expect(result).toBe('Simple text again');
        });
    });

    describe('makeDefaultLinkPreviewHeaders', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should match snapshot of default link preview header', async () => {
            const req = { originalUrl: 'https://www.ugroop.com/' };
            const content = '<html><head></head><body>Test</body></html>';
            const result = await linkPreview.makeDefaultLinkPreviewHeaders(
                req,
                content,
            );

            expect(result).toMatchSnapshot();
        });
    });

    describe('makeLinkPreviewHeaders', () => {
        let content;
        let match;
        let req;
        let res;
        let hash;
        let templateData;
        let result;

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should be able to append the necessary headers if info is available', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = {
                content: 'My Tour',
                customData: {
                    shortDescription: 'This is a sample tour',
                },
                photos: [
                    {
                        content: '/images/header.jpg',
                    },
                ],
            };

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });

        it('should not append headers if no info is available (1)', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = null;

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });

        it('should not append the custom data if not available', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = {
                content: 'My Tour',
            };

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });

        it('should not append the photo if not available (1)', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = {
                content: 'My Tour',
                customData: {
                    shortDescription: 'This is a sample tour',
                },
            };

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });

        it('should not append the photo if not available (2)', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = {
                content: 'My Tour',
                customData: {
                    shortDescription: 'This is a sample tour',
                },
                photos: [],
            };

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });

        it('should not append the photo if not available (3)', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = {
                content: 'My Tour',
                customData: {
                    shortDescription: 'This is a sample tour',
                },
                photos: [{ id: 1 }],
            };

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });

        it('should not append the photo if not available (4)', async () => {
            hash = '12345';
            match = ['', hash];
            req = mockRequest('https', 'some.domain.com');
            res = {};

            templateData = {
                content: 'My Tour',
                customData: {
                    shortDescription: 'This is a sample tour',
                },
                photos: { data: 'stuff' },
            };

            mockFetch('https://some.domain.com/api', templateData);

            content = '<html><head></head><body>Test</body></html>';

            result = await linkPreview.makeLinkPreviewHeaders(
                req,
                res,
                content,
                match,
            );

            expect(result).toMatchSnapshot();
        });
    });
});

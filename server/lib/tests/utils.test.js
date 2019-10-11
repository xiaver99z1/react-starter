const utils = require('../utils');

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
        internalHeaders,
        headers: {
            host: internalHeaders.Host,
        },
        get: hdr => internalHeaders[hdr],
    };
};

describe('utils.js', () => {
    const htmlPage =
        '<html><head><meta charset="utf-8" /></head><body>Test only</body></html>';
    let result;

    describe('appendToHtmlHead', () => {
        let expected;

        it('should return the original html content if there are no tags to append to the header', () => {
            result = utils.appendToHtmlHead(htmlPage, []);
            expect(result).toBe(htmlPage);
        });

        it('should return the modified html content if there are tags to append to the header', () => {
            expected =
                '<html><head><meta charset="utf-8" />  <!-- Comment -->\n    <script src="test.js"></script>\n  </head><body>Test only</body></html>';
            result = utils.appendToHtmlHead(htmlPage, [
                '<!-- Comment -->',
                '<script src="test.js"></script>',
            ]);
            expect(result).toBe(expected);
        });
    });

    describe('makeEmptyElement', () => {
        it('should return an empty tag with no attributes if there are no attribute name/value pairs', () => {
            result = utils.fn.makeEmptyElement('br');
            expect(result).toBe('<br  />');
        });

        it('should return a lowercase empty tag', () => {
            result = utils.fn.makeEmptyElement('BR');
            expect(result).toBe('<br  />');
        });

        it('should return an empty tag with attributes (1)', () => {
            result = utils.fn.makeEmptyElement('img', {
                src: '/images/test.jpg',
                alt: 'Test image',
            });
            expect(result).toBe('<img src="/images/test.jpg" alt="Test image" />');
        });

        it('should return an empty tag with attributes (2)', () => {
            result = utils.fn.makeEmptyElement('img', {
                src: '/images/test.jpg',
                width: 100,
            });
            expect(result).toBe('<img src="/images/test.jpg" width="100" />');
        });

        it('should ignore attributes that are neither string nor number (1)', () => {
            result = utils.fn.makeEmptyElement('img', {
                date: new Date(),
                src: '/images/test.jpg',
            });
            expect(result).toBe('<img src="/images/test.jpg" />');
        });

        it('should ignore attributes that are neither string nor number (2)', () => {
            result = utils.fn.makeEmptyElement('img', {
                yes: true,
                src: '/images/test.jpg',
            });
            expect(result).toBe('<img src="/images/test.jpg" />');
        });

        it('should ignore attributes that are neither string nor number (3)', () => {
            result = utils.fn.makeEmptyElement('img', {
                obj: {},
                att: [],
                src: '/images/test.jpg',
            });
            expect(result).toBe('<img src="/images/test.jpg" />');
        });
    });

    describe('makeMetaTag', () => {
        it('should return a META element with the attributes', () => {
            result = utils.makeMetaElement({
                name: 'extra',
                property: 'length is five',
            });
            expect(result).toBe('<meta name="extra" property="length is five" />');
        });
    });

    describe('addHtmlDocPrefix', () => {
        it('should return the prefixed html page', () => {
            result = utils.addHtmlDocPrefix(htmlPage, 'my', 'https://my.com');
            expect(result).toBe(
                '<html prefix="my: https://my.com"><head><meta charset="utf-8" /></head><body>Test only</body></html>',
            );
        });
    });

    describe('getPortFromHostname', () => {
        it('should return the port number beside the hostname', () => {
            result = utils.fn.getPortFromHostname('localhost:8080');
            expect(result).toBe(8080);
        });

        it('should return null if no port', () => {
            result = utils.fn.getPortFromHostname('localhost');
            expect(result).toBe(null);
        });

        it('should return null if host is not a string', () => {
            result = utils.fn.getPortFromHostname(123);
            expect(result).toBe(null);
        });
    });

    describe('getPort', () => {
        let headersList;
        let req;
        let port;

        describe('case with reverse proxy:', () => {
            it('use port from X-Forwarded-Port if it exists (1)', () => {
                headersList = {
                    'X-Forwarded-For': '200.100.90.80:8888',
                    'X-Forwarded-Port': 9999,
                };

                req = mockRequest('http', 'some.domain.com', undefined, headersList);

                port = utils.fn.getPort(req);
                expect(port).toBe(9999);
            });

            it('use port from X-Forwarded-Port if it exists (2)', () => {
                headersList = {
                    'X-Forwarded-For': '200.100.90.80:8888',
                    'X-Forwarded-Port': 9999,
                };

                req = mockRequest('http', 'some.domain.com', 6666, headersList);

                port = utils.fn.getPort(req);
                expect(port).toBe(9999);
            });

            it('use port from hostname if X-Forwarded-Port does not exist (1)', () => {
                headersList = {
                    'X-Forwarded-For': '200.100.90.80:8888',
                };

                req = mockRequest('http', 'some.domain.com', undefined, headersList);
                port = utils.fn.getPort(req);

                expect(port).toBe(8888);
            });

            it('use port from hostname if X-Forwarded-Port does not exist (2)', () => {
                headersList = {
                    'X-Forwarded-For': '200.100.90.80:8888, 10.1.1.1:7777',
                };

                req = mockRequest('http', 'some.domain.com', undefined, headersList);
                port = utils.fn.getPort(req);

                expect(port).toBe(8888);
            });

            it('use port from hostname if X-Forwarded-Port does not exist (3)', () => {
                headersList = {
                    'X-Forwarded-For': '200.100.90.80',
                };

                req = mockRequest('http', 'some.domain.com', undefined, headersList);
                port = utils.fn.getPort(req);

                expect(port).toBe(null);
            });

            it('use port from hostname if X-Forwarded-Port does not exist (4)', () => {
                headersList = {
                    'X-Forwarded-For': '200.100.90.80, 10.1.1.1:7777',
                };

                req = mockRequest('http', 'some.domain.com', undefined, headersList);
                port = utils.fn.getPort(req);
                expect(port).toBe(null);
            });
        });

        describe('case without reverse proxy', () => {
            it('use port from Host header if it is provided (1)', () => {
                req = mockRequest('http', 'some.domain.com', 6666);
                port = utils.fn.getPort(req);

                expect(port).toBe(6666);
            });

            it('use port from Host header if it is provided (2)', () => {
                req = mockRequest('http', 'some.domain.com');

                port = utils.fn.getPort(req);
                expect(port).toBe(null);
            });
        });
    });

    describe('canonicalUrl', () => {
        let url;

        it('should return the same URL if it is simple', () => {
            url = 'http://some.domain.com/';
            expect(utils.fn.canonicalUrl(url)).toBe('http://some.domain.com/');
        });

        it('should return the same URL with trailing slash if it originally has no slash', () => {
            url = 'http://some.domain.com';
            expect(utils.fn.canonicalUrl(url)).toBe('http://some.domain.com/');
        });

        it('should strip redundant ports (1)', () => {
            url = 'http://some.domain.com:80/';
            expect(utils.fn.canonicalUrl(url)).toBe('http://some.domain.com/');
        });

        it('should strip redundant ports (2)', () => {
            url = 'https://some.domain.com:443/';
            expect(utils.fn.canonicalUrl(url)).toBe('https://some.domain.com/');
        });

        it('should strip auth details (1)', () => {
            url = 'https://user@some.domain.com/';
            expect(utils.fn.canonicalUrl(url)).toBe('https://some.domain.com/');
        });

        it('should strip auth details (2)', () => {
            url = 'https://user:pass@some.domain.com/';
            expect(utils.fn.canonicalUrl(url)).toBe('https://some.domain.com/');
        });

        it('should strip the query string', () => {
            url = 'https://some.domain.com/admin?stuff=xyz';
            expect(utils.fn.canonicalUrl(url)).toBe('https://some.domain.com/admin');
        });

        it('should strip the fragment', () => {
            url = 'https://some.domain.com/admin#para';
            expect(utils.fn.canonicalUrl(url)).toBe('https://some.domain.com/admin');
        });

        it('should retain only the bare URL', () => {
            url = 'https://user:pass@some.domain.com/admin?stuff=xyz#para';
            expect(utils.fn.canonicalUrl(url)).toBe('https://some.domain.com/admin');
        });
    });

    describe('getRequestBaseUrl', () => {
        it('should be able to determine the request base URL', () => {
            const req = mockRequest('http', 'some.domain.com');

            expect(utils.fn.getRequestBaseUrl(req)).toBe('http://some.domain.com/');
        });

        it('should be able to determine the request base URL if port is given', () => {
            const req = mockRequest('http', 'some.domain.com', 8888);

            expect(utils.fn.getRequestBaseUrl(req)).toBe(
                'http://some.domain.com:8888/',
            );
        });
    });

    describe('getFullApiUrl', () => {
        let oldAccountBaseUrl;
        let req;
        let endpoint;
        let url;

        beforeEach(() => {
            oldAccountBaseUrl = process.env.ACCOUNT_BASE_URL;
        });

        afterEach(() => {
            process.env.ACCOUNT_BASE_URL = oldAccountBaseUrl;
        });

        it('should return the joined base URL and endpoint of the base URL is already absolute (1)', () => {
            process.env.ACCOUNT_BASE_URL = 'https://some.domain.com/api/';
            req = {};
            endpoint = '/users/123';

            url = utils.getFullApiUrl(req, endpoint);
            expect(url).toBe('https://some.domain.com/api/users/123');
        });

        it('should return the joined base URL and endpoint of the base URL is already absolute (2)', () => {
            process.env.ACCOUNT_BASE_URL = 'https://some.domain.com/api'; // No trailing slash
            req = {};
            endpoint = '/users/123';

            url = utils.getFullApiUrl(req, endpoint);
            expect(url).toBe('https://some.domain.com/api/users/123');
        });

        it('should return an absolute URL if the base API url is relative (1)', () => {
            process.env.ACCOUNT_BASE_URL = '/some/api/';
            req = mockRequest('https', 'some.domain.com');
            endpoint = '/users/123';

            url = utils.getFullApiUrl(req, endpoint);
            expect(url).toBe('https://some.domain.com/some/api/users/123');
        });

        it('should return an absolute URL if the base API url is relative (2)', () => {
            process.env.ACCOUNT_BASE_URL = '/some/api'; // No trailing slash
            req = mockRequest('https', 'some.domain.com');
            endpoint = '/users/123';

            url = utils.getFullApiUrl(req, endpoint);
            expect(url).toBe('https://some.domain.com/some/api/users/123');
        });

        it('should return an absolute URL if the base API url is relative (3)', () => {
            process.env.ACCOUNT_BASE_URL = '/some/api/';
            req = mockRequest('https', 'some.domain.com', 8443);
            endpoint = '/users/123';

            url = utils.getFullApiUrl(req, endpoint);
            expect(url).toBe('https://some.domain.com:8443/some/api/users/123');
        });

        it('should return an absolute URL if the base API url is null', () => {
            delete process.env.ACCOUNT_BASE_URL;
            req = mockRequest('https', 'some.domain.com');
            endpoint = '/users/123';

            url = utils.getFullApiUrl(req, endpoint);
            expect(url).toBe('http://localhost:8080/api/users/123');
        });
    });

    describe('getFullUrl', () => {
        let req;
        let path;
        let url;

        it('should return the given path (canonicalized) if its already absolute (1)', () => {
            req = {};
            path = 'https://some.domain.com/api/users/123';

            url = utils.getFullUrl(req, path);

            expect(url).toBe('https://some.domain.com/api/users/123');
        });

        it('should return the given path (canonicalized) if its already absolute (2)', () => {
            req = {};
            path = 'https://some.domain.com/api/users/123?sort=asc&by=id';

            url = utils.getFullUrl(req, path);

            expect(url).toBe('https://some.domain.com/api/users/123');
        });

        it('should return the absolute canonical URL if the path is relative (1)', () => {
            req = mockRequest('https', 'some.domain.com');
            path = '/api/users/123';

            url = utils.getFullUrl(req, path);

            expect(url).toBe('https://some.domain.com/api/users/123');
        });

        it('should return the absolute canonical URL if the path is relative (2)', () => {
            req = mockRequest('https', 'some.domain.com');
            path = '/api/users/123?sort=asc&by=id';

            url = utils.getFullUrl(req, path);

            expect(url).toBe('https://some.domain.com/api/users/123');
        });
    });
});

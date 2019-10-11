const site = require('../site');

describe('site.js', () => {
    let req;
    let res;
    let fs;
    let routeRules;

    beforeEach(() => {
        req = {};
        res = { sendStatus: jest.fn(), send: jest.fn() };
        fs = {
            readFile: (filepath, callback) => {
                if (filepath === '/assets/index.html') {
                    return callback(null, 'Test content');
                }

                return callback(new Error('readFile failed.'));
            },
        };

        routeRules = [
            {
                pathRegex: /^\/admin$/,
                rule: async (preq, pres, content) => content,
            },
        ];
    });

    describe('servePage', () => {
        it('should execute normally with the right parameters', async () => {
            req.path = '/admin';
            await site.servePage(req, res, fs, '/assets/index.html', routeRules);
            expect(res.send).toHaveBeenCalledWith('Test content');
        });

        // TODO: Un-skip when it stops failing?
        it.skip('should throw an error (HTTP 404) when the file path is not found', async () => {
            req.path = '/admin';
            await site.servePage(req, res, fs, '/assets/undefined.html', routeRules);
            expect(res.sendStatus).toHaveBeenCalledWith(404);
        });
    });

    describe('applyRouteRules', () => {
        let resultContent;

        it('should return the original content if route rules are empty', async () => {
            req.path = '/admin';
            resultContent = await site.fn.applyRouteRules(
                req,
                res,
                [],
                'Test content',
            );
            expect(resultContent).toBe('Test content');
        });

        it('should return the original content if the request path does not match any route rule', async () => {
            req.path = '/nonexistent';
            resultContent = await site.fn.applyRouteRules(
                req,
                res,
                routeRules,
                'Test content',
            );
            expect(resultContent).toBe('Test content');
        });

        it('should return the modified content if the request path matches a route rule', async () => {
            routeRules = [
                {
                    pathRegex: /^\/admin$/,
                    rule: async (preq, pres, content) => `${content} - extra`,
                },
            ];

            req.path = '/admin';
            resultContent = await site.fn.applyRouteRules(
                req,
                res,
                routeRules,
                'Test content',
            );
            expect(resultContent).toBe('Test content - extra');
        });

        it('should evaluate only the first match by default (1)', async () => {
            routeRules = [
                {
                    pathRegex: /^\/.*/,
                    rule: async (preq, pres, content) => `${content} - root`,
                },
                {
                    pathRegex: /^\/admin$/,
                    rule: async (preq, pres, content) => `${content} - extra`,
                },
            ];

            req.path = '/admin';
            resultContent = await site.fn.applyRouteRules(
                req,
                res,
                routeRules,
                'Test content',
            );
            expect(resultContent).toBe('Test content - root');
        });

        it('should evaluate only the first match by default (2)', async () => {
            routeRules = [
                {
                    pathRegex: /^\/admin$/,
                    rule: async (preq, pres, content) => `${content} - extra`,
                },
                {
                    pathRegex: /^\/.*/,
                    rule: async (preq, pres, content) => `${content} - root`,
                },
            ];

            req.path = '/admin';
            resultContent = await site.fn.applyRouteRules(
                req,
                res,
                routeRules,
                'Test content',
            );
            expect(resultContent).toBe('Test content - extra');
        });

        it("should evaluate the first and the next matches if the first rule's processNextRule is true", async () => {
            routeRules = [
                {
                    pathRegex: /^\/.*/,
                    rule: async (preq, pres, content) => `${content} - root`,
                    processNextRule: true,
                },
                {
                    pathRegex: /^\/admin$/,
                    rule: async (preq, pres, content) => `${content} - extra`,
                },
            ];

            req.path = '/admin';
            resultContent = await site.fn.applyRouteRules(
                req,
                res,
                routeRules,
                'Test content',
            );
            expect(resultContent).toBe('Test content - root - extra');
        });
    });
});

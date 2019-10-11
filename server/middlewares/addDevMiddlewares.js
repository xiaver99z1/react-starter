const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const site = require('../lib/site');
const routeRules = require('../routeRules');

function createWebpackMiddleware(compiler, publicPath) {
    return webpackDevMiddleware(compiler, {
        noInfo: true,
        logLevel: 'warn',
        publicPath,
        silent: true,
        stats: 'errors-only',
    });
}

module.exports = function addDevMiddlewares(app, webpackConfig) {
    const compiler = webpack(webpackConfig);
    const middleware = createWebpackMiddleware(
        compiler,
        webpackConfig.output.publicPath,
    );

    app.use(middleware);
    app.use(
        webpackHotMiddleware(compiler, {
            heartbeat: 2000,
        }),
    );

    // Since webpackDevMiddleware uses memory-fs internally to store build
    // artifacts, we use it instead
    const fs = middleware.fileSystem;

    app.get('*', async (req, res, next) => {
        try {
            await site.servePage(
                req,
                res,
                fs,
                path.join(compiler.outputPath, '_index.html'),
                routeRules,
            );
        } catch (err) {
            next(err);
        }
    });
};

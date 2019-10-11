const path = require('path');
const express = require('express');
const compression = require('compression');
const fs = require('fs');
const site = require('../lib/site');
const routeRules = require('../routeRules');

module.exports = function addProdMiddlewares(app, options) {
    const publicPath = options.publicPath || '/';
    const outputPath = options.outputPath || path.resolve(process.cwd(), 'build');

    // compression middleware compresses your server responses which makes them
    // smaller (applies also to assets). You can read more about that technique
    // and other good practices on official Express.js docs http://mxs.is/googmy
    app.use(compression());
    app.use(publicPath, express.static(outputPath));

    app.get('*', async (req, res, next) => {
        try {
            await site.servePage(
                req,
                res,
                fs,
                path.join(outputPath, '_index.html'),
                routeRules,
            );
        } catch (err) {
            next(err);
        }
    });
};

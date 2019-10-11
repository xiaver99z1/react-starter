/**
 * COMMON WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
// Remove this line once the following warning goes away (it was meant for webpack loader authors not users):
// 'DeprecationWarning: loaderUtils.parseQuery() received a non-string value which can be problematic,
// see https://github.com/webpack/loader-utils/issues/56 parseQuery() will be replaced with getOptions()
// in the next major version of loader-utils.'
process.noDeprecation = true;

module.exports = options => ({
    mode: options.mode,
    entry: options.entry,
    output: Object.assign(
        {
            // Compile into js/build.js
            path: path.resolve(process.cwd(), 'build'),
            publicPath: '/',
        },
        options.output,
    ), // Merge with env dependent settings
    optimization: options.optimization,
    module: {
        noParse: /node_modules\/localforage\/dist\/localforage.js/,
        rules: [
            {
                test: /\.jsx?$/, // Transform all .js/.jsx files required somewhere with Babel
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: options.babelQuery,
                },
            },
            {
                // Preprocess our own .css files
                // This is the place to add your own loaders (e.g. sass/less etc.)
                // for a list of loaders, see https://webpack.js.org/loaders/#styling
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader'],
            },
            {
                // Preprocess 3rd party .css files located in node_modules
                test: /\.css$/,
                include: /node_modules/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(eot|otf|ttf|woff|woff2)$/,
                use: 'file-loader',
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-url-loader',
                        options: {
                            // Inline files smaller than 10 kB
                            limit: 10 * 1024,
                            noquotes: true,
                        },
                    },
                ],
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // Inline files smaller than 10 kB
                            limit: 10 * 1024,
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                enabled: false,
                                // NOTE: mozjpeg is disabled as it causes errors in some Linux environments
                                // Try enabling it in your environment by switching the config to:
                                // enabled: true,
                                // progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 7,
                            },
                            pngquant: {
                                quality: '65-90',
                                speed: 4,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                use: 'html-loader',
            },
            {
                test: /\.(mp4|webm)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                    },
                },
            },
            {
                test: /\.modernizrrc.js$/,
                use: 'modernizr-loader',
            },
            {
                test: /\.modernizrrc(\.json)?$/,
                use: 'modernizr-loader!json-loader',
            },
        ],
    },
    plugins: options.plugins.concat([
        // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
        // inside your code for any environment checks; UglifyJS will automatically
        // drop any unreachable code.
        new webpack.DefinePlugin({
            'process.env': {
                CI: JSON.stringify(process.env.CI),
                BUILD_NUM: JSON.stringify(process.env.BUILD_NUM || '0'),
                BRANCH: JSON.stringify(process.env.BRANCH),
                STABLE_BRANCH: JSON.stringify(process.env.STABLE_BRANCH),
                COMPARE_URL: JSON.stringify(process.env.COMPARE_URL),
                BUILD_URL: JSON.stringify(process.env.BUILD_URL),
                HOSTNAME: JSON.stringify(process.env.HOSTNAME),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                ENV: JSON.stringify(process.env.ENV),
                GOOGLE_CAPTCHA_API_KEY: JSON.stringify(
                    process.env.GOOGLE_CAPTCHA_API_KEY ||
                    '6LdijRgUAAAAAHsVwozWBaa_C-BCcOlBWgwFdiBB',
                ),
                GOOGLE_MAPS_API_KEY: JSON.stringify(
                    process.env.GOOGLE_MAPS_API_KEY ||
                    'AIzaSyBubwxzI7Ysd_EbVI5HwUjYLvAZGlzWBeA',
                ),
                REGION: JSON.stringify(process.env.AWS_REGION || 'us-west-2'),
                USER_POOL_ID: JSON.stringify(
                    process.env.AWS_COGNITO_USERPOOL_ID || 'us-west-2_VSOwzQwc1',
                ),
                USER_POOL_WEB_CLIENTID: JSON.stringify(
                    process.env.AWS_COGNITO_USERPOOL_WEBCLIENT_ID ||
                    '1rpul45pa4c04e2t8hpqso18e9',
                ),
                ACCOUNT_BASE_URL: JSON.stringify(
                    process.env.ACCOUNT_BASE_URL || 'http://localhost:8080/api',
                ),
                APP_VERSION: JSON.stringify(pkg.version),
            },
        }),
        new ServiceWorkerWebpackPlugin({
            entry: path.join(process.cwd(), 'src/firebase-messaging-sw.js'),
            filename: 'firebase-messaging-sw.js',
        }),
    ]),
    node: {
        __filename: true, // populates filenames relative to your app root
        fs: 'empty',
    },
    resolve: {
        modules: ['node_modules', 'app'],
        extensions: ['.js', '.jsx', '.react.js', '.json'],
        mainFields: ['browser', 'jsnext:main', 'main'],
        alias: {
            modernizr$: path.resolve(process.cwd(), '.modernizrrc'),
            moment$: 'moment/moment.js',
        },
    },
    devtool: options.devtool,
    target: 'web', // Make web variables accessible to webpack, e.g. window
    performance: options.performance || {},
});

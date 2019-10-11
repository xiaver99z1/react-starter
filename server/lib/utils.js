const _ = require('lodash');
const u = require('url');
const urlJoin = require('url-join');

const appendToHtmlHead = (htmlPage, arrayOfElements) =>
    arrayOfElements.reduce(
        (html, el) => html.replace(/<\/head>/i, `  ${el}\n  $&`),
        htmlPage,
    );

const makeEmptyElement = (tagName, objAttrValuePairs = {}) => {
    const attrValArray = [];

    Object.keys(objAttrValuePairs).forEach(key => {
        if (
            typeof objAttrValuePairs[key] === 'string' ||
            typeof objAttrValuePairs[key] === 'number'
        ) {
            const val = `${objAttrValuePairs[key]}`;
            attrValArray.push(`${key.toLowerCase()}="${_.escape(val)}"`);
        }
    });

    return `<${tagName.toLowerCase()} ${attrValArray.join(' ')} />`;
};

const makeMetaElement = objAttrValuePairs =>
    makeEmptyElement('meta', objAttrValuePairs);

const addHtmlDocPrefix = (htmlPage, prefix, uri) =>
    htmlPage.replace(
        /(<html(\s+([^>]+)?)?)(>)/i,
        `$1 prefix="${prefix}: ${uri}">`,
    );

const getPortFromHostname = host => {
    let ret = null;

    if (host && typeof host === 'string') {
        const hostList = host.split(/\s*,\s*/);

        const match = hostList[0].match(/^[^:]+:(\d+)/);
        if (match) {
            ret = parseInt(match[1], 10);
        }
    }

    return ret;
};

const getPort = req => {
    // Determine the port based on the X-Forwarded-Port, X-Forwarded-For, and the Host headers
    let candidatePort = null;

    const xff = req.get('X-Forwarded-For');

    if (xff) {
        // Reverse proxy detected
        candidatePort = req.get('X-Forwarded-Port');

        if (!candidatePort) {
            candidatePort = getPortFromHostname(xff);
        }
    } else {
        // Straightforward connection from client
        candidatePort = getPortFromHostname(req.headers.host);
    }

    return candidatePort;
};

const canonicalUrl = url => {
    const urlObj = new u.URL(url);
    return u.format(urlObj, { auth: false, fragment: false, search: false });
};

const getRequestBaseUrl = req => {
    const scheme = req.protocol;
    const hostname = req.hostname;
    const port = getPort(req);

    if (!port) {
        return canonicalUrl(`${scheme}://${hostname}`);
    }

    return canonicalUrl(`${scheme}://${hostname}:${port}`);
};

const getFullApiUrl = (req, endpoint) => {
    let fullUrl;

    const baseApiUrl =
        process.env.ACCOUNT_BASE_URL || 'http://localhost:8080/api';

    if (baseApiUrl.match(/^[^:]+:/)) {
        // Already an absolute URL
        fullUrl = urlJoin(baseApiUrl, endpoint);
    } else {
        const reqBaseUrl = getRequestBaseUrl(req);
        fullUrl = urlJoin(reqBaseUrl, baseApiUrl, endpoint);
    }

    return fullUrl;
};

const getFullUrl = (req, path) => {
    const fullUrl = path.trim();

    if (fullUrl.match(/^[^:]+:/)) {
        // Already an absolute URL
        return canonicalUrl(fullUrl);
    }

    return canonicalUrl(urlJoin(getRequestBaseUrl(req), fullUrl));
};

const fn = {
    makeEmptyElement,
    getPortFromHostname,
    getPort,
    canonicalUrl,
    getRequestBaseUrl,
};

module.exports = {
    appendToHtmlHead,
    makeMetaElement,
    addHtmlDocPrefix,
    getFullApiUrl,
    getFullUrl,
    fn,
};

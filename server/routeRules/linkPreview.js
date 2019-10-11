const fetch = require('node-fetch');
const utils = require('../lib/utils');

const DESCRIPTION_MAX_LENGTH = 300;
const IMAGE_PREVIEW_WIDTH = 300;
const UGROOP_LOGIN_IMG_URL =
    'https://s3-us-west-2.amazonaws.com/com.ugroop.public/ugroop_cover.jpg';

const normalizeDescription = text => {
    // Collapse every whitespace sequence into a single space.
    const result = text.replace(/(\s|\r|\n)+/g, ' ');

    return result.substr(0, DESCRIPTION_MAX_LENGTH).trim();
};

const makeDefaultLinkPreviewHeaders = async (req, content) => {
    const link = utils.getFullUrl(req, req.originalUrl);

    const htmlHeaders = [
        utils.makeMetaElement({
            name: 'twitter:card',
            content: 'summary_large_image',
        }),
        utils.makeMetaElement({ property: 'og:url', content: link }),
        utils.makeMetaElement({ property: 'og:type', content: 'website' }),
        utils.makeMetaElement({ property: 'og:title', content: 'uGroop' }),
        utils.makeMetaElement({ property: 'og:site_name', content: 'uGroop' }),
        utils.makeMetaElement({
            property: 'og:image:alt',
            content: 'uGroop photo',
        }),
        utils.makeMetaElement({
            property: 'og:description',
            content:
                'Start organising your tour today. Let us guide you on where you are headed.',
        }),
        utils.makeMetaElement({
            property: 'og:image',
            content: `${UGROOP_LOGIN_IMG_URL}`,
        }),
    ];

    const result = utils.addHtmlDocPrefix(content, 'og', 'http://ogp.me/ns#');
    return utils.appendToHtmlHead(result, htmlHeaders);
};

const makeLinkPreviewHeaders = async (req, res, content, match) => {
    const hashKey = match[1];

    const link = utils.getFullUrl(req, req.originalUrl);

    let htmlHeaders = [];

    const fullUrl = utils.getFullApiUrl(req, `/Pub/template/${hashKey}`);

    const fetchResult = await fetch(fullUrl);

    if (fetchResult) {
        htmlHeaders = [
            utils.makeMetaElement({
                name: 'twitter:card',
                content: 'summary_large_image',
            }),
            utils.makeMetaElement({ property: 'og:url', content: link }),
            utils.makeMetaElement({ property: 'og:type', content: 'website' }),
            utils.makeMetaElement({ property: 'og:site_name', content: 'uGroop' }),
        ];

        const templateData = await fetchResult.json();
        const title = templateData.content;
        htmlHeaders.push(
            utils.makeMetaElement({ property: 'og:title', content: title }),
        );

        if (templateData.customData && templateData.customData.shortDescription) {
            const desc = normalizeDescription(
                templateData.customData.shortDescription,
            );
            htmlHeaders.push(
                utils.makeMetaElement({ property: 'og:description', content: desc }),
            );
        }

        if (
            templateData.photos &&
            templateData.photos.length &&
            templateData.photos.length > 0 &&
            templateData.photos[0].content
        ) {
            const photo = utils.getFullApiUrl(req, templateData.photos[0].content);
            htmlHeaders.push(
                utils.makeMetaElement({
                    property: 'og:image',
                    content: `${photo}?width=${IMAGE_PREVIEW_WIDTH}`,
                }),
            );
            htmlHeaders.push(
                utils.makeMetaElement({
                    property: 'og:image:alt',
                    content: 'Tour photo',
                }),
            );
        }

        const result = utils.addHtmlDocPrefix(content, 'og', 'http://ogp.me/ns#');
        return utils.appendToHtmlHead(result, htmlHeaders);
    }

    return content;
};

const fn = {
    normalizeDescription,
};

module.exports = {
    makeLinkPreviewHeaders,
    makeDefaultLinkPreviewHeaders,
    fn,
};

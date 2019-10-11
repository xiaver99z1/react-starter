const linkPreview = require('./linkPreview');

const routeRules = [
    /* ** Format for each rule:
    {
      pathRegex: /regex for URL path to match/,
      rule: async (req, res, content, match) => {
        // 'content' is the web page content and 'match' is the result of the URL regex match,
        // the same object returned by JavaScript String.match().

        // Some code here that modifies the page content, e.g.
        const modifiedContent = modify_content(content);

        // Return the modified content
        return modifiedContent;
      },
      processNextRule: true,  // Optional, defaults to false (do not process any more rules when this rule matches).
                              // Rules are processed from top to bottom.
    },
    ** */
    {
        pathRegex: /^\/public\/template\/([^/]+)/,
        rule: async (req, res, content, match) =>
            linkPreview.makeLinkPreviewHeaders(req, res, content, match),
        processNextRule: false,
    },
    {
        pathRegex: /\//,
        rule: async (req, res, content) =>
            linkPreview.makeDefaultLinkPreviewHeaders(req, content),
        processNextRule: false,
    },
];

module.exports = routeRules;

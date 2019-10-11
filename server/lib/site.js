const readFile = (fs, filePath) =>
    new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

const servePage = async (req, res, fs, filePath, routeRules) => {
    try {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        const file = await readFile(fs, filePath);
        const content = await applyRouteRules(
            req,
            res,
            routeRules,
            file.toString(),
        );
        res.send(content);
    } catch (ex) {
        // Let the front end do the 404 thing than express
        const file = await readFile(fs, filePath);
        res.send(file.toString());
    }
};

const applyRouteRules = async (req, res, routeRules, content) => {
    let result = content;

    const len = routeRules.length;

    for (let i = 0; i < len; i += 1) {
        const match = req.path.match(routeRules[i].pathRegex);
        if (match != null) {
            result = await routeRules[i].rule(req, res, result, match); // eslint-disable-line no-await-in-loop

            if (!routeRules[i].processNextRule) {
                return result;
            }
        }
    }

    return result;
};

const fn = {
    applyRouteRules,
};

module.exports = {
    servePage,
    readFile,
    fn,
};

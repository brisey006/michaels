const { compile } = require('path-to-regexp');

module.exports = (name, hash, urls) => {
    const data = urls.find(e => {
        return e.name == name;
    });
    const hashString = JSON.stringify(hash);
    const hashObj = JSON.parse(hashString);
    const toPathRaw = compile(data.url);
    return toPathRaw(hashObj);

    /**if (Object.keys(hash).length > 0) {
        const toPathRaw = compile(data.url);
        return toPathRaw(hashObj);
    } else {
        return name;
    } */
}
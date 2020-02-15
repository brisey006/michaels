const { compile } = require('path-to-regexp');
const moment = require('moment');

module.exports = {
    url: (name, options) => {
        const hash = options.hash;
        const hashString = JSON.stringify(hash);
        const hashObj = JSON.parse(hashString);
        if (Object.keys(options.hash).length > 0) {
            const toPathRaw = compile(name);
            return toPathRaw(hashObj);
        } else {
            return name;
        }
    },
    parseUrl: (name, urls, options) => {
        const hash = options.hash;
        if (urls != undefined) {
            const data = urls.find(e => {
                return e.name == name;
            });
            const hashString = JSON.stringify(hash);
            const hashObj = JSON.parse(hashString);
            if (Object.keys(hash).length > 0) {
                const toPathRaw = compile(data.url);
                return toPathRaw(hashObj);
            } else {
                return data.url;
            }
        } else {
            return '#';
        }
    },
    formatDate: (d) => {
        return moment(d).format("MMMM Do YYYY, HH:mm");
    }
}
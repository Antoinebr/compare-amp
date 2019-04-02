const fetch = require('node-fetch');

process.argv.splice(0, 2);

const [url] = process.argv;

const authorizeIframe = async (url) => {

    const response = await fetch(url);

    if (!response.ok) {
        throw new error(await response.text());
    }

    try {
        return [...response.headers].filter(a => a[0] === "x-frame-options")[0][1]
    } catch (e) {
        return false;
    }

};


authorizeIframe(url).then(console.log)

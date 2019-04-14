const cf = require('./corsFree');
const isURL = require('validator/lib/isURL');


/**
 * @name searchForLinkRelValue
 * @summary will parse a HTML page as string and return the first link rel="${}" It will only work on front-end ( DOMParser only exists in navigator)
 * @param {string} fetchedPage 
 * @param {string} linkRelType 
 * @returns {url || false} the URL of false 
 */
const searchForLinkRelValueInHTML = (HTMLasString,linkRelType) => {

    if (typeof HTMLasString !== "string" && typeof linkRelType !== "string") {
        throw new Error(`We expected a string as HTMLasString and linkRelType we got HTMLasString : ${typeof sourceURL} linkRelType ${typeof linkRelType}`);
    }

    const parser = new DOMParser();

    const htmlDocument = parser.parseFromString(HTMLasString, "text/html");

    const linkRel = htmlDocument.documentElement.querySelector(`link[rel="${linkRelType}"`);

    if(linkRel === null) return false;
    
    const href = linkRel.getAttribute("href");

    if(href === null) return false; 

    return href;
}



/**
 * @name getAlternativeURL
 * @summary return the AMP URL from the cannonical URL or the opposite (this function should be used on front-end only)
 * @param {string} sourceURL URL ( could be the cannonical URL or the AMP url)
 * @param {string} linkRelType the linkRelType amp-html,canonical...
 * @returns {Promise || error} the promise will contain the alternative URL 
 */
exports.getAlternativeURL = async (sourceURL, linkRelType) => {

    if (typeof sourceURL !== "string") {
        throw new Error(`We expected a string as sourceURL we got ${typeof sourceURL}`);
    }

    if (!isURL(sourceURL)) {
        throw new Error(`We expected an URL we got ${sourceURL}`);
    }

    if (typeof linkRelType !== "string") {
        throw new Error(`We expected a string as linkRelType we got ${typeof linkRelType}`);
    }

    const fetchedPage = await cf.corsFree(sourceURL);

    const alternativeURL = searchForLinkRelValueInHTML(fetchedPage,linkRelType);

    if (!alternativeURL) {
        throw new Error(`We couldn't find a valid alternativeURL`);
    }

    return alternativeURL;
}
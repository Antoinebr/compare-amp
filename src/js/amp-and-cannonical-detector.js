const isURL = require('validator/lib/isURL');

/**
 * @name getAlternativeURL
 * @summary return the AMP URL from the cannonical URL or the opposite (this function should be used on front-end only)
 * @param {string} sourceURL URL ( could be the cannonical URL or the AMP url)
 * @returns {Promise || error} the promise will contain the alternative URL 
 */
exports.getAlternativeURL = async (sourceURL, linkRelType) => {

	let alternativeURL = null;

	if (typeof sourceURL !== "string") {
		throw new Error(`We expected a string as sourceURL we got ${typeof sourceURL}`);
	}

	if (!isURL(sourceURL)) {
		throw new Error(`We expected an URL we got ${sourceURL}`);
	}

	if (typeof linkRelType !== "string") {
		throw new Error(`We expected a string as linkRelType we got ${typeof linkRelType}`);
	}

	//Using cors-anywhere API to fetch the URL without origin issues
	const fetchedPage = await fetch(`https://cors-anywhere.herokuapp.com/${sourceURL}`, {
		mode: 'cors'
	});

	if (!fetchedPage.ok) throw new Error(`We received an invalid response when trying to get a CORS free version of ${sourceURL} ${await fetchedPage.text()}`);

	const fetchedPageTextReesponse = await fetchedPage.text();

	const parser = new DOMParser();
	const htmlDocument = parser.parseFromString(fetchedPageTextReesponse, "text/html");

	alternativeURL = htmlDocument.documentElement.querySelector(`link[rel="${linkRelType}"`).getAttribute("href");
	
	if (!isURL(alternativeURL)) {
		throw new Error(`We couldn't find a valid alternativeURL we got ${alternativeURL}`);
	}

	return alternativeURL;
}
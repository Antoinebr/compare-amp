/**
 * @name corsFree
 * @description return a HTML page content by bypassing CORS
 * @param {string|url} sourceURL the URL to 'descorsify"
 * @returns {promise|erorr} will return a promise or error 
 */

exports.corsFree = async (sourceURL) => {
    //Using cors-anywhere API to fetch the URL without origin issues
    const fetchedPage = await fetch(`https://cors-anywhere.herokuapp.com/${sourceURL}`, {
        mode: 'cors'
    });

    if (!fetchedPage.ok) throw new Error(`We received an invalid response when trying to get a CORS free version of ${sourceURL} ${await fetchedPage.text()}`);

    return await fetchedPage.text();
}
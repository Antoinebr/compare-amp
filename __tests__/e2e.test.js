const puppeteer = require('puppeteer');
const { app } = require('./a2e-assets/app');
let browser = null;
let server;

/**
 * beforeAll 
 * 
 * Runs before running all the tests
 */
beforeAll(async () => {

    // the port for the node app which serves our app staticly
    process.env.PORT = process.env.PORT || 8373;
    // we run the express app 
    server = app.listen(process.env.PORT);

    browser = await puppeteer.launch({
        headless: false,
        slowMo: 80,
        args: ['--window-size=1920,1080']
    });

});


/**
 * afterAll 
 * 
 * Runs after running all the tests
 */
afterAll(async () => {
    // we close the browser
    await browser.close();
    // we close the express app
    server.close();
});


describe('Test the form', () => {

    it('should return an error when an AMP url is missing', async () => {

        const page = await browser.newPage();
        await page.goto(`http://localhost:${process.env.PORT}/`);
        await page.click('input[name="cannonicalURL"]');
        await page.type('input[name="cannonicalURL"]', 'https://google.fr/');
        await page.click('form button');
        await page.waitFor(1000);
        const finalText = await page.$eval('.errors-msg', el => el.textContent); // will return the content of this element

        expect(finalText).toEqual(expect.stringContaining('is not a valid'));

    }, 30000);

    it('should return an error when a Canonical url is missing', async () => {

        const page = await browser.newPage();
        await page.goto(`http://localhost:${process.env.PORT}/`);
        await page.click('input[name="ampURL"]');
        await page.type('input[name="ampURL"]', 'https://google.fr/');
        await page.click('form button');
        await page.waitFor(1000);
        const finalText = await page.$eval('.errors-msg', el => el.textContent); // will return the content of this element

        expect(finalText).toEqual(expect.stringContaining('is not a valid'));

    }, 30000);


    it('should only be possible to only one checkbox', async () => {

        const page = await browser.newPage();
        await page.goto(`http://localhost:${process.env.PORT}/`);
        await page.click('input[name="forceIframeMode"]');
        await page.click('input[name="screenshotsOnlyMode"');
        await page.click('input[name="autoMode"');
        // we get all the checkbox then we create an array then we filter the true values then we should get only one true value
        const checkboxes = await page.$$eval(`input[type="checkbox"]`, checkboxes => checkboxes.map( checkbox => checkbox.checked).filter(e => e === true));
        expect(checkboxes.length).toEqual(1);

    },30000);


    it('should show the URLs into screenshots', async () => {

        const page = await browser.newPage();
        await page.goto(`http://localhost:${process.env.PORT}/`);
        await page.click('input[name="cannonicalURL"]');
        await page.type('input[name="cannonicalURL"]', 'https://google.fr/');
        await page.click('input[name="ampURL"]');
        await page.type('input[name="ampURL"]', 'https://google.fr/');
        await page.click('form button');
        await page.waitFor(3000); // should wait we get the reponse form the : "is iframeable API"
        const finalText = await page.$eval('.errors-msg', el => el.textContent); // will return the content of this element
        await page.waitFor(1000);
        const imgSrcIframeCanonical = await page.$eval('#iframe-canonical', el => el.src);
        const imgSrcIframeAmp = await page.$eval('#iframe-amp', el => el.src);

        expect(finalText).toEqual(expect.stringContaining('The site blocked iframes !'));
        expect(imgSrcIframeAmp).toEqual(expect.stringContaining('/screenshot/'));
        expect(imgSrcIframeCanonical).toEqual(expect.stringContaining('/screenshot/'));


    }, 30000);

});
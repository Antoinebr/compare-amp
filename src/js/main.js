import css from '@css/app.scss'

import { getAlternativeURL } from './amp-and-cannonical-detector';

const $form = document.querySelector('form');
const $checkboxes = document.querySelectorAll('input[type="checkbox"]');

/**
 * @name iFrameTemplate
 * @description an HTML template string for the iFrame
 * @param {string} src 
 * @param {string} id the id of the the HTML element
 */
const iFrameTemplate = (src, id = "") => `<iframe id="${id}" class="u-shadowS" width="412" height="12000" src="${src}" frameborder="0"></iframe>`;


/**
 * @name imageTemplate
 * @description an HTML template string for the image
 * @param {string} src 
 * @param {string} id the id of the the HTML element
 */
const imageTemplate = (src, id = "") => `<img id="${id}" class="u-shadowS" width="412px" src="${src}"/>`;


// Allow only one checkbox to be ticked 
$checkboxes.forEach(elemenent => elemenent.addEventListener('click', function(e) {

    $checkboxes.forEach(elemenent => elemenent.checked = false)
    this.checked = true;
}));


/**
 * @name testIframes
 * @description Test if a given URL can be iframed
 * @param {string} cannonicalURL 
 * @param {str} ampURL 
 * @returns {promises || error}
 */
const testIframes = async (cannonicalURL, ampURL) => {

    let [iframeTestCanonical, iframeTestAMP] = await Promise.all([fetch(`https://us-central1-speedracenl.cloudfunctions.net/is-iframeable?url=${cannonicalURL}`), fetch(`https://us-central1-speedracenl.cloudfunctions.net/is-iframeable?url=${ampURL}`)])

    if (!iframeTestCanonical.ok) {
        throw new Error(`We couldn't query the API to check if the iFrames on cannonical are authorized : ${await iframeTestCanonical.text() }`);
    }

    if (!iframeTestAMP.ok) {
        throw new Error(`We couldn't query the API to check if the iFrames on AMP are authorized : ${await iframeTestAMP.text() }`);
    }

    const cannonicalIframeResult = await iframeTestCanonical.json();

    const ampIframeResult = await iframeTestAMP.json();

    return {
        cannonicalCanBeIframed: cannonicalIframeResult.canBeIframed,
        ampCanBeIframed: ampIframeResult.canBeIframed
    };
}


/**
 * @name removeErrorMsg
 * @description remove the erorr message from the UI 
 * @returns {void}
 */
const removeErrorMsg = () => {

    if (document.querySelector('.errors-msg') !== null) {
        $form.removeChild(document.querySelector('.errors-msg'));
    }
}


/**
 * @name errorMsg
 * @description add an error message to the UI 
 * @param {string} error 
 * @param {string} type of error ( warning || error || success)
 */
const errorMsg = (error, type) => {
    removeErrorMsg();
    $form.insertAdjacentHTML('beforeend', `<p class="errors-msg msg--${type} u-pts u-pbs u-pls u-prs">${error}</p>`);
}


/**
 * @name addLoader
 * @description add the loader to the UI
 * @returns {void}
 */
const addLoader = () => {

    $form.insertAdjacentHTML('beforeend',
        `
		<svg class="spinner u-dbma" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
			<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
		</svg>
	`);
}


/**
 * @name removeLoader
 * @description remove the loader to the UI
 * @returns {void}
 */
const removeLoader = () => {
    if (document.querySelector('.spinner') !== null) {
        $form.removeChild(document.querySelector('.spinner'));
    }
}


/**
 * @name toggleCompareButton
 * @description update the content of the button
 * @returns {void}
 */
const toggleCompareButton = () => {
    const $compareButton = $form.querySelector('button');
    if ($compareButton.disabled) {
        $compareButton.innerHTML = "Compare the two URLs";
        $compareButton.disabled = false;
    } else {
        $compareButton.innerHTML = "Loading URL comparison...";
        $compareButton.disabled = true;
    }
}


/**
 * @name tryToGetAlternateURL
 * @description Try to inject in the page the alternative URL form a given URL
 * @param {string} sourceURL should be a valid URL
 * @param {HTMLElement} alternateURLField an existing HTML element
 * @param {string} linkRelType the value of link rel "amphtml" "cannonical"...
 */
const tryToGetAlternateURL = async (sourceURL, alternateURLField, linkRelType) => {
    //remove any existing detector buttons
    if (document.querySelector('.detector') !== null) {
        const detector = document.querySelector('.detector');
        detector.parentNode.removeChild(detector);
    }

    alternateURLField.previousElementSibling.insertAdjacentHTML('beforeend', '<a href="#" class="detector"> - Detect?</a>');
    const newDetector = document.querySelector('.detector');

    newDetector.addEventListener('click', async function(e) {

        e.preventDefault();
        this.disabled = true;
        this.innerHTML = " - Detecting...";

        const alternativeURL = await getAlternativeURL(sourceURL, linkRelType).catch(e => {
            this.innerHTML = " - Detection failed. Try again?";
            this.disabled = true;
            console.error(e);
        });

        alternateURLField.value = alternativeURL ? alternativeURL : "";

        if (alternativeURL) this.parentNode.removeChild(this);

    });

}


$form.addEventListener('submit', async function(e) {

    try {

        e.preventDefault();

        removeErrorMsg();

        let [smoothScroll, isURL, imagesLoaded] = await Promise.all([import('scroll-to-element'), import('validator/lib/isURL'), import('images-loaded')]);

        smoothScroll = smoothScroll.default;
        isURL = isURL.default;
        imagesLoaded = imagesLoaded.default;

        const cannonicalURL = this.cannonicalURL.value;

        const ampURL = this.ampURL.value;

        if (!isURL(this.cannonicalURL.value)) {
            errorMsg('The Cannonical URL is not a valid URL', 'error')
            return false;
        }

        if (!isURL(this.ampURL.value)) {
            errorMsg('The AMP URL is not a valid URL', 'error')
            return false;
        }

        // Prevent multiple clicks while loading
        toggleCompareButton();

        addLoader();

        const $iframeContainer = document.querySelector('.iframe-container');

        //Clear existing comparisons
        $iframeContainer.innerHTML = "";

        // insert the headers 
        $iframeContainer.insertAdjacentHTML('afterbegin', `
	
		<h2 class="cannonical"> Canonical </h2> 
					
		<h2 class="amp"> AMP </h2>
		
		`);


        if (this.forceIframeMode.checked) {

            $iframeContainer.insertAdjacentHTML('beforeend', iFrameTemplate(`https://cors-my-site-rby6ot2pbq-uc.a.run.app/?url=${this.ampURL.value}`, 'iframe-amp'));
            $iframeContainer.insertAdjacentHTML('beforeend', iFrameTemplate(`https://cors-my-site-rby6ot2pbq-uc.a.run.app/?url=${this.cannonicalURL.value}`, 'iframe-canonical'));


            errorMsg(`We are forcing the site to display inside iFrames ! <strong>This can lead to visual differences</strong>`, 'warning');
        }


        if (this.screenshotsOnlyMode.checked) {

            $iframeContainer.insertAdjacentHTML('beforeend', imageTemplate(`https://puppeteer-rby6ot2pbq-uc.a.run.app/screenshot/?url=${this.cannonicalURL.value}`, 'iframe-canonical'))
            $iframeContainer.insertAdjacentHTML('beforeend', imageTemplate(`https://puppeteer-rby6ot2pbq-uc.a.run.app/screenshot/?url=${this.ampURL.value}`, 'iframe-amp'))

            errorMsg(`You are in screenshot only mode `, 'success');

            $iframeContainer.style.visibility = "hidden";
            await imagesLoaded('.iframe-container');
            $iframeContainer.style.visibility = "visible";
        }



        if (this.autoMode.checked) {

            const { cannonicalCanBeIframed, ampCanBeIframed } = await testIframes(this.cannonicalURL.value, this.ampURL.value);

            if (cannonicalCanBeIframed) {
                // check if the cannonicalCanBeIframed 
                $iframeContainer.insertAdjacentHTML('beforeend', iFrameTemplate(this.cannonicalURL.value, 'iframe-canonical'));
            } else {
                // else use a screenshot 
                $iframeContainer.insertAdjacentHTML('beforeend', imageTemplate(`https://puppeteer-rby6ot2pbq-uc.a.run.app/screenshot/?url=${this.cannonicalURL.value}`, 'iframe-canonical'));
            }


            if (ampCanBeIframed) {
                $iframeContainer.insertAdjacentHTML('beforeend', iFrameTemplate(this.ampURL.value, 'iframe-amp'));
            } else {
                $iframeContainer.insertAdjacentHTML('beforeend', imageTemplate(`https://puppeteer-rby6ot2pbq-uc.a.run.app/screenshot/?url=${this.ampURL.value}`, 'iframe-amp'));
            }


            if (!cannonicalCanBeIframed || !ampCanBeIframed) {

                let errorDetail = "";

                if (!cannonicalCanBeIframed) {
                    errorDetail = "for the cannonical page only";
                }

                if (!ampCanBeIframed) {
                    errorDetail = "for the ⚡️ amp page only";
                }

                if (!cannonicalCanBeIframed && !ampCanBeIframed) {
                    errorDetail = "for both pages";
                }

                errorMsg(`The site blocked iframes ! We are falling back on screenshots <strong>${errorDetail}</strong>!`, 'warning');
                $iframeContainer.style.visibility = "hidden";
                await imagesLoaded('.iframe-container');
                $iframeContainer.style.visibility = "visible";
            }


        }

        removeLoader();
        toggleCompareButton();

        smoothScroll('.iframe-container', {
            offset: -200,
            duration: 700
        });


        window.location.hash = `?ampURL=${ampURL}&cannonicalURL=${cannonicalURL}`;


    } catch (e) {

        errorMsg(`Something wrong happened : ${e.toString()}`, 'error');

    }

});


$form.cannonicalURL.addEventListener('change', async function(e) {
    tryToGetAlternateURL(this.value, $form.ampURL, 'amphtml').catch(console.log)
});


$form.ampURL.addEventListener('change', async function(e) {
    tryToGetAlternateURL(this.value, $form.cannonicalURL, 'canonical').catch(console.log)
});


if (window.location.hash !== "" && window.location.hash.includes('ampURL') && window.location.hash.includes('cannonicalURL')) {

    const currentURL = window.location.hash.replace("#", "");

    const URLparams = new URLSearchParams(currentURL);

    if (URLparams.has('ampURL') && URLparams.has('cannonicalURL')) {

        $form.cannonicalURL.value = URLparams.get('cannonicalURL');
        $form.ampURL.value = URLparams.get('ampURL');

        document.querySelector('form button').click();
    }

}
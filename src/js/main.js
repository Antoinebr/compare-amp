import css from '@css/app.scss'

import imagesLoaded from 'images-loaded';
import { createCipher } from 'crypto';



const testIframes = async (cannonicalURL, ampURL) => {

	let [iframeTestCanonical, iframeTestAMP] = await Promise.all([fetch(`https://authorizeiframe.speedwat.ch/url/?url=${cannonicalURL}`), fetch(`https://authorizeiframe.speedwat.ch/url/?url=${ampURL}`)])

	const cannonicalIframeResult = await iframeTestCanonical.json();

	const ampIframeResult = await iframeTestAMP.json();

	if (cannonicalIframeResult.canBeIframed && ampIframeResult.canBeIframed) {
		return true;
	}

	return false;
}

const $form = document.querySelector('form');


const errorMsg = (error,type)=> {

	if (document.querySelector('.errors-msg') !== null) {
		$form.removeChild(document.querySelector('.errors-msg'));
	}

	$form.insertAdjacentHTML('beforeend', `<p class="errors-msg msg--${type} u-pts u-pbs u-pls u-prs">${error}</p>`);
}



const addLoader = () => {

	$form.insertAdjacentHTML('beforeend',
	`<svg class="spinner u-dbma" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
			<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
	</svg>`);
}


const removeLoader = () => {
	if (document.querySelector('.spinner') !== null) {
		$form.removeChild(document.querySelector('.spinner'));
	}
}

const toggleCompareButton = () => {
	const $compareButton = $form.querySelector('button');
	if($compareButton.disabled){
		$compareButton.innerHTML = "Compare the two URLs";
		$compareButton.disabled = false;
	}
	else{
		$compareButton.innerHTML = "Loading URL comparison...";
		$compareButton.disabled = true;
	}
}

const prepareDetection = async (currentField, otherField, tagToFind) => {
	//remove any existing detector buttons
	if (document.querySelector('.detector') !== null) {
		var detector = document.querySelector('.detector');
		detector.parentNode.removeChild(detector);
	}
	//show a detector button on the other field, if the currentfield has a valid URL
	let isURL = await import('validator/lib/isURL');
	isURL = isURL.default;
	if (isURL(currentField.value)){
		
		otherField.previousElementSibling.insertAdjacentHTML('beforeend','<a href="#" class="detector"> - Detect?</a>');
		var newDetector = document.querySelector('.detector');
		newDetector.addEventListener('click', async function(e){
			e.preventDefault();
			this.disabled=true;
			this.innerHTML=" - Detecting...";
			var otherURL = await detectOtherUrl(currentField, otherField,tagToFind);
			if (otherURL){
				otherField.value = otherURL;
				this.parentNode.removeChild(this);
			}else{
				this.innerHTML=" - Detection failed. Try again?";
				this.disabled = true;
			}
		});
	}
}

const detectOtherUrl = async (currentField, otherField, tagToFind) => {
	
	var detectedURL = false;
	var parsedURL = "";

	try{
		var fetchedPage = await fetch(currentField.value, {mode:'cors'})
		.then( response => response.text())
		.then( text => {
			const parser = new DOMParser();
			const htmlDocument = parser.parseFromString(text, "text/html");
			try{
				parsedURL = htmlDocument.documentElement.querySelector("link[rel='"+tagToFind+"']").getAttribute("href");
			}catch(error){
				return detectedURL;
			}
			detectedURL = parsedURL;
		});
	}catch{
		return detectedURL;
	}

	return detectedURL;
}

$form.addEventListener('submit', async function (e) {

	e.preventDefault();

	// Prevent multiple clicks while loading
	toggleCompareButton();

	let [smoothScroll, isURL] = await Promise.all([import('scroll-to-element'), import('validator/lib/isURL')]);

	smoothScroll = smoothScroll.default;

	isURL = isURL.default;

	const cannonicalURL =  this.cannonicalURL.value;

	const ampURL =  this.ampURL.value;

	if (!isURL(this.cannonicalURL.value)) {
		errorMsg('The Cannonical URL is not a valid URL','error')
		return false;
	}

	if (!isURL(this.ampURL.value)) {
		errorMsg('The AMP URL is not a valid URL','error')
		return false;
	}


	const canTheyBeIframed = await testIframes(this.cannonicalURL.value, this.ampURL.value).catch(console.log)

	const $iframeContainer = document.querySelector('.iframe-container');

	$iframeContainer.classList.add('big');

	if (!canTheyBeIframed) {
		

		errorMsg('The site blocked iframes ! We are falling back on screenshots !','warning');

		//Clear existing comparisons
		$iframeContainer.innerHTML = "";

		$iframeContainer.insertAdjacentHTML('afterbegin',`

			<h2 class="cannonical"> Canonical </h2> 
						
			<h2 class="amp"> AMP </h2>

			<img id="iframe-canonical" class="u-shadowS" width="412px" src="https://puppeteer.speedwat.ch/screenshot/?url=${this.cannonicalURL.value}" />
			
			<img id="iframe-amp" class="u-shadowS" width="412px" src="https://puppeteer.speedwat.ch/screenshot/?url=${this.ampURL.value}" />
		`);


		addLoader();

		$iframeContainer.style.visibility = "hidden";

		await imagesLoaded('.iframe-container');
		
		removeLoader();

		//Re-enable compare button
		toggleCompareButton();
		
		$iframeContainer.style.visibility = "visible";
	}



	if (canTheyBeIframed) {

		//Re-enable compare button
		toggleCompareButton();

		//Clear existing comparisons
		$iframeContainer.innerHTML = "";

		$iframeContainer.insertAdjacentHTML('afterbegin',`

			<h2 class="cannonical"> Canonical </h2> 
							
			<h2 class="amp"> AMP </h2>

			<iframe id="iframe-canonical" class="u-shadowS" width="412" height="12000" src="${this.cannonicalURL.value}" frameborder="0"></iframe>
			
			<iframe id="iframe-amp" class="u-shadowS" width="412" height="12000" src="${this.ampURL.value}" frameborder="0"></iframe>
			
		`);

	}




	smoothScroll('.iframe-container', {
		offset: -200,
		duration: 700
	});


	window.location.hash = `${ampURL}[-vs-]${cannonicalURL}`;

});

$form.cannonicalURL.addEventListener('change', async function (e) {
	prepareDetection(this, $form.ampURL, 'amphtml');
});
$form.ampURL.addEventListener('change', async function (e) {
	prepareDetection(this, $form.cannonicalURL, 'canonical');
});

if (window.location.hash !== "" && window.location.hash.includes('[-vs-]')) {

	const [cannonicalURL, ampURL] = window.location.hash.replace("#", "").split('[-vs-]');

	$form.cannonicalURL.value = cannonicalURL;
	$form.ampURL.value = ampURL;

	document.querySelector('form button').click();


}
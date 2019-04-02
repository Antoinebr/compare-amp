import css from '@css/app.scss'



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



$form.addEventListener('submit', async function (e) {

	e.preventDefault();

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

		$iframeContainer.innerHTML = `

			<h2 class="cannonical"> Canonical </h2> 
						
			<h2 class="amp"> AMP </h2>

			<img id="iframe-canonical" class="u-shadowS" width="412px" src="https://puppeteer.speedwat.ch/screenshot/?url=${this.cannonicalURL.value}" />
			
			<img id="iframe-amp" class="u-shadowS" width="412px" src="https://puppeteer.speedwat.ch/screenshot/?url=${this.ampURL.value}" />

		`;

	
	}



	if (canTheyBeIframed) {

		$iframeContainer.innerHTML = `

			<h2 class="cannonical"> Canonical </h2> 
						
			<h2 class="amp"> AMP </h2>

			<iframe id="iframe-canonical" class="u-shadowS" width="412" height="12000" src="${this.cannonicalURL.value}" frameborder="0"></iframe>
			
			<iframe id="iframe-amp" class="u-shadowS" width="412" height="12000" src="${this.ampURL.value}" frameborder="0"></iframe>
			
		`;

	}




	smoothScroll('.iframe-container', {
		offset: -200,
		duration: 700
	});


	window.location.hash = `${ampURL}[-vs-]${cannonicalURL}`;

});


if (window.location.hash !== "" && window.location.hash.includes('[-vs-]')) {

	const [cannonicalURL, ampURL] = window.location.hash.replace("#", "").split('[-vs-]');

	$form.cannonicalURL.value = cannonicalURL;
	$form.ampURL.value = ampURL;

	document.querySelector('form button').click();


}
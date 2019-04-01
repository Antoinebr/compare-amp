import css from '@css/app.scss'

const $form = document.querySelector('form');

$form.addEventListener('submit', async function(e){

	e.preventDefault();

	let [smoothScroll,isURL] = await Promise.all([import('scroll-to-element'),import('validator/lib/isURL')]);

	smoothScroll = smoothScroll.default;

	isURL = isURL.default;

	if( ! isURL(this.cannonicalURL.value) ){

		alert('The Cannonical URL is not a valid URL');
		return false;
	}

	if( ! isURL(this.ampURL.value) ){
		alert('The AMP URL is not a valid URL');
		return false;
	}


	const $iframeContainer = document.querySelector('.iframe-container');
	
	$iframeContainer.innerHTML = `

	<h2 class="cannonical"> Canonical </h2> 
				
	<h2 class="amp"> AMP </h2>

	<iframe class="u-shadowS" width="412" height="12000" src="${this.cannonicalURL.value}" frameborder="0"></iframe>
	
	<iframe class="u-shadowS" width="412" height="12000" src="${this.ampURL.value}" frameborder="0"></iframe>
	
	`;
	
	smoothScroll('.iframe-container', {
		offset: -200,
		duration: 700
	});


	window.location.hash = `${this.cannonicalURL.value}[-vs-]${this.ampURL.value}`; 


});


if(window.location.hash !== "" &&  window.location.hash.includes('[-vs-]')){

	const [cannonicalURL, ampURL] = window.location.hash.replace("#","").split('[-vs-]');

	$form.cannonicalURL.value = cannonicalURL;
	$form.ampURL.value = ampURL;

	document.querySelector('form button').click();

}

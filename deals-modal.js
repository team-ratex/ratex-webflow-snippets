/**
 * Javascript object to encapsulate the modal selection
 * Basically, we are emulating a front-end 'state' of selected card to show in the modal
 */ 
var modalPreviousState = "none";
const modalLogicHandler = (() => {
	/************************ Init ************************/
	// Set up observers
	const modalSelector = '.product-modal-popup-wrapper';
	const modalMutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	const modalObserver = new MutationObserver((mutations) => {
	  mutations.forEach(function(mutation) {
	  	if (mutation.attributeName !== 'style') return;
			let currentValue = mutation.target.style.display;
      if (currentValue != previousValue) {
      	if (mutation.type == "attributes") {
		      // Modal did get activated
		      if ($(modalSelector).is(':visible')) {
		      	console.log('Modal is shown');
		      }
		      if ($(modalSelector).is(':hidden')) {
		      	console.log('Modal is hidden');
		      }
		    }
      }
	  });
	});
	modalObserver.observe(document.querySelector(modalSelector), {
		attributes: true,
	});


  return {
  	/************************ Variables ************************/
  	defaultObject: {}, // Placeholder items, essentially
  	selectedObject: {}, // Empty object, ready to get set by the current card clicked

  	/************************ Functions ************************/
  	/** On modal dismiss, we basically - 
  	 * Set our selected object to null
  	 * Reset the modal data to default object
  	 */
  	onModalDismiss: () => {

  	},
  	/** On card clicked, we basically - 
  	 *  Update the selected object based on the card's data
  	 *  Render the modal based on said data
  	*/
  	onCardClicked: (element) => {
  		// Grab card object
  		const cardClicked = $(element);
  		// Grab attributes of the card
  		modalLogicHandler.selectedObject = {
  			title: cardClicked.find('.product-name').html(),
  			description: cardClicked.find('#description-container ul li'), // Will be an array of text
  			reviewsCount: '',
  			stars: '',
  			itemUrl: cardClicked.find('.product-page').html(),
  		};
  	},
  	/** 
  	  * Updates the modal data on click
  	*/
  	renderModalData: () => {

  	},  	
  	/** Renders the call to action button when user opens the modal
  	 *  There's 2 options
  	   * Download RateX (For CHROME users who do not have our extension)
  	   * Go to Amazon (For users who have our extension OR users not on chrome)
  	*/
  	renderCallToActionButton: () => {

  	},
  };
})();

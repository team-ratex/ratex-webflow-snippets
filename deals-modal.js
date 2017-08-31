/**
 * Javascript object to encapsulate the modal selection
 * Basically, we are emulating a front-end 'state' of selected card to show in the modal
 */ 
const modalLogicHandler = (() => {
	/************************ Init ************************/
	/** Basically setting up modal observers
	  * So that we know when to mutate the data of the modal
    * This is a self-calling function (it gets called upon declaration)
	*/
  const setUpModalObservers = (() => {
    const modalSelector = '.product-modal-popup-wrapper';
    const modalMutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach(function(mutation) {
        // Check if style chagned, and value is different from previously
        if ((mutation.attributeName == 'style') && (mutation.target.style.display != modalLogicHandler.modalPreviousState)) {
          if (mutation.type == "attributes") {
            // Modal did get activated
            if ($(modalSelector).is(':visible')) {
              modalLogicHandler.onModalShow();
              modalLogicHandler.modalPreviousState = "block";
            }
            // Modal did get dismissed
            if ($(modalSelector).is(':hidden')) {
              modalLogicHandler.onModalDismiss();
              modalLogicHandler.modalPreviousState = "none";
            }
          }
        }
      });
    });
    modalObserver.observe(document.querySelector(modalSelector), {
      attributes: true,
    });
  })();
	/** Set up additonal onclick handlers for all cards in deals	
    * This is a self-calling function (it gets called upon declaration)
  */
  const setUpCardsToHaveAdditionalOnClickListener = (() => {
    $('.shop > .deals').each((idx, item)=> {
      item.on("click", () => {
        modalLogicHandler.onCardClicked();
      });
    });
  })();


  return {
  	/************************ Variables ************************/
  	defaultObject: {}, // Placeholder items, essentially
  	selectedObject: {}, // Empty object, ready to get set by the current card clicked
		modalPreviousState: "none", // State to know whether modal is currently showing or hidden
  	
		/************************ Functions ************************/
  	/** On card clicked, we basically - 
  	 *  Update the selected object based on the card's data
  	 *  Render the modal based on said data
  	*/
  	onCardClicked: (element) => {
  		// Grab card object
  		const cardClicked = $(element);
      console.log(cardClicked);
  		// Grab attributes of the card
  		modalLogicHandler.selectedObject = {
  			title: cardClicked.find('.product-name').html(),
  			description: cardClicked.find('#description-container ul li'), // Will be an array of text
  			reviewsCount: '16',
  			stars: '4', // Should be URL
  			itemUrl: cardClicked.find('.product-page').html(),
  			buttonText: '$$$$ on Amazon',
  		};
  	},
  	/** On modal dismiss, we basically - 
  	 * Set our selected object to null
  	 * Reset the modal data to default object
  	 */
  	onModalDismiss: () => {
  		console.log('dismissed')
  		modalLogicHandler.selectedObject = {}; // TEMP HACK - JUST DELETE OBJECT
  	},
  	/** 
  	  * Updates the modal data on click
  	*/
  	onModalShow: () => {
  		console.log('shown')
  		const modalContainer = $('.product-modal-popup-wrapper .product-content-wraper');
  		// Set title
  		// modalContainer.
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

/**
 * Javascript object to encapsulate the modal selection
 * Basically, we are emulating a front-end 'state' of selected card to show in the modal
 */ 
const modalLogicHandler = (() => {
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
  		modalLogicHandler.

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

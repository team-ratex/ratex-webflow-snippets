$(() => {
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
        $(item).on("click", () => {
          modalLogicHandler.onCardClicked(item);
        });
      });
    })();

    /** Set up additonal interaction handlers to prevent touch-events on mobile from propagating (From modal->body)
      * Source: https://stackoverflow.com/a/16898264
      * This is a self-calling function (it gets called upon declaration)
    */
    const setUpTouchEventsScrollingForMobile = (() => {
      const elem = (document.getElementsByClassName('product-content-wraper'))[0];
      elem.addEventListener('touchstart', function(event){
          this.allowUp = (this.scrollTop > 0);
          this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
          this.prevTop = null; 
          this.prevBot = null;
          this.lastY = event.pageY;
      });

      elem.addEventListener('touchmove', function(event){
          var up = (event.pageY > this.lastY), 
              down = !up;

          this.lastY = event.pageY;

          if ((up && this.allowUp) || (down && this.allowDown)) 
              event.stopPropagation();
          else 
              event.preventDefault();
      });
    })();

    return {
      /************************ Variables ************************/
      // Placeholder items, essentially
      defaultObject: {
        imageSrc: $('.product-modal-popup-wrapper .product-content-wraper')
                    .find('.image-43').attr("src"),
        title: $('.product-modal-popup-wrapper .product-content-wraper')
                    .find('.heading-9').html(),
        description: null, // Will be an array of text
        starsSrc: $('.product-modal-popup-wrapper .product-content-wraper')
                    .find('.image-46').attr("src"), // Should be URL
        reviewsCount: $('.product-modal-popup-wrapper .product-content-wraper')
                    .find('#reviews-count').html(),
        itemUrl: '#',
        buttonText: '',
      },
      selectedObject: {}, // Empty object, ready to get set by the current card clicked
      modalPreviousState: "none", // State to know whether modal is currently showing or hidden
      modalContainer: $('.product-modal-popup-wrapper .product-content-wraper'),

      /************************ Functions ************************/
      /** On card clicked, we basically - 
       *  Update the selected object based on the card's data
       *  Render the modal based on said data
      */
      onCardClicked: (element) => {
        // Grab card object
        const cardClicked = $(element);
        // Grab attributes of the card
        modalLogicHandler.selectedObject = {
          imageSrc: cardClicked.find('.thumbnail-image').attr("src"),
          title: cardClicked.find('.product-name').html(),
          description: cardClicked.find('#description-container ul').html(), // Will be an array of text
          starsSrc: cardClicked.find('#star-rating').attr("src"), // Should be URL
          reviewsCount: cardClicked.find('#reviews-count').html(),
          itemUrl: cardClicked.find('.product-page').html(),
          buttonText: cardClicked.find('#cta-price').html(),
        };
      },

      /** On modal dismiss, we basically - 
       * Set our selected object to null
       * Reset the modal data to default object
       */
      onModalDismiss: () => {
        $('html, body').css({ overflow: 'auto'});
        modalLogicHandler.selectedObject = modalLogicHandler.defaultObject;
        modalLogicHandler.renderModal(
          modalLogicHandler.modalContainer
          modalLogicHandler.defaultObject
        );
      },

      /** 
        * Updates the modal data on click
      */
      onModalShow: () => {
        // Disable scrolling on background
        $('html, body').css({ overflow: 'hidden'});
        // Render modal data
        modalLogicHandler.renderModal(
          modalLogicHandler.modalContainer
          modalLogicHandler.selectedObject
        );
        // Render CTA on modal
        modalLogicHandler.renderCallToActionButton(modalLogicHandler.modalContainer);      
      },

      /**
        * Render modal data
      */
      renderModal: (modalContainer, data) => {
        // Set image
        modalContainer.find('.image-43')
          .attr('src', data.imageSrc);
        // Set Title
        modalContainer.find('.heading-9')
          .html(data.title);
        // Set description (it's a list of <li>)
        modalContainer.find('.paragraph-2')
          .html(data.description);
        // Set stars image
        modalContainer.find('.image-46')
          .attr('src', data.starsSrc);
        // Set reviews count
        modalContainer.find('.text-block-19')
          .text(data.reviewsCount);
      },

      /** Renders the call to action button when user opens the modal
       *  There's 2 options
         * Download RateX (For CHROME users who do not have our extension)
         * Go to Amazon (For users who have our extension OR users not on chrome)
      */
      renderCallToActionButton: (modalContainer) => {
        // Naive: No extension way for now
        const hasExtension = document.getElementById('ratex-extension-is-installed');
        const isChrome = !!window.chrome && !!window.chrome.webstore;
        const isFirefox = (navigator.userAgent.indexOf("Firefox") > 0);
        // Show download for Chrome users (temporary leave out firefox)
        if (!hasExtension && isChrome) {
          // Show install button
          modalContainer.find('.cta-wrapper').show();
          modalContainer.find('#cta-buy').hide();
          // Update the URL of the `skip to site`
          modalContainer.find('.cta-wrapper').find('.link-11')
            .attr('href', modalLogicHandler.selectedObject.itemUrl);
        } else {
          // Show buy button
          modalContainer.find('.cta-wrapper').hide();
          modalContainer.find('#cta-buy').show();          
          // Set itemURL
          modalContainer.find('#cta-buy')
            .attr('href', modalLogicHandler.selectedObject.itemUrl);
          // Set button text
          modalContainer.find('#cta-buy')
            .text(modalLogicHandler.selectedObject.buttonText);
        }
      },
    };
  })();
})
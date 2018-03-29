// On document ready
$(function () {

	let Config = {
		dealsContainer: $('.deals-container')[0],
		currentCategory: 'Daily',
		offset: 0,
		hasMore: 'true',
		isFetchingDeals: false,
	};

	let RatesDealsHandler = {
		/**
		* Creates a new product card
		*/
		createNewCard: function () {
			let newCard = Config.dealsContainer.firstElementChild.cloneNode(true);
			Config.dealsContainer.appendChild(newCard);
		},
		/**
		* Displays the correct currency format.
		*
		* @param {Object}       deal		Object representation of the deal to format the currency for.
		* @returns {String}     the formatted currency
		*/
		getCurrency: function (deal) {
			if (deal.listing.currency == "SGD") {
				return "S$";
			}
			else {
				return "$";
			}
		},
		/**
		* Rounds the currency to the specified decimal places
		*
		* @param {Number}		value			Value to be rounded off.
		* @param {Number}		decimals	Number of decimal places to round off to if decimal places exist.
		* @returns {Number}		Savings, rounded to 2 d.p if decimal numbers exist, else rounded to 0 d.p.
		*/
		round: function (value, decimals) {
			const savings = Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
			if (savings % 1.00 > 0) { // if there are decimals, display with 2 decimal places
				return savings.toFixed(2);
			}
			else { // if there are no decimals, do not display decimal places
				return savings;
			}
		},
		/**
		* Calculate savings for the deal based on current and previous price
		*
		* @param {Object}		deal		Object representation of the deal to calculate savings for.
		* @returns {Number}		Savings, rounded to 2 d.p if decimal numbers exist, else rounded to 0 d.p.
		*/
		calculateSavings: function (deal) {
			const savings = parseFloat(deal.listing.previousPrice) - parseFloat(deal.listing.currentPrice);
			return RatesDealsHandler.round(savings, 2); // more accurate rounding method
		},
		/**
		* Add ellipsis where product name cuts off
		*
		* @param {Object}		dealTitle		Object representation of the deal to add ellipsis to.
		*/
		clamp: function (dealTitle) {
			$clamp(dealTitle, { clamp: 2 });
		},
		/* can be used for activities feed in future
		getTimeAgo: function (lastCreated) {
			const date = lastCreated.substring(0, 10);
			date = date.replace(/-/g, "");
			date = date + ", " + lastCreated.substring(11, 16);
			
			return moment(date, "YYYYMMDD, hh:mm").fromNow();
		},
		*/
		/**
		* Change the string to title case
		*
		* @param {String}		str		the String object to be changed to title case
		* @returns {String}		the string that has been formatted to title case
		*/
		toTitleCase: function (str) {
			return str.replace(/\w\S*/g,
				function (txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
		},
		/**
		* Removes all existing card except the first one, hides the first one
		*/
		resetFeed: function () {
			Config.offset = 0;
			Config.hasMore = true;
			$('.deal-card')[0].style.display = "none";
			let j = 0;
			for (j = $('.deal-card').length; j > 1; j--) {
				Config.dealsContainer.removeChild(Config.dealsContainer.lastChild);
			}
		},
		/**
		* Prevents background scrolling on desktop
		*/
		noscroll: function () {
			window.scrollTo(0, 0);
		},
		/**
		* Toggles between showing and hiding modal
		*/
		toggleModal: function () {
			if ($('.modal-bg')[0].style.display === "flex") {
				$('.modal-bg')[0].style.display = "none";
			} else {
				$('.modal-bg')[0].style.display = "flex";
			}
		},
		/**
		* Toggles between showing and hiding the "Page Not Found" alert
		*/
		toggleError: function () {
			if ($('.error-bg')[0].style.display === "flex") {
				$('.error-bg')[0].style.display = "none";
			} else {
				$('.error-bg')[0].style.display = "flex";
			}
		},
		/**
		* Populate deal cards with information fetched from RateS endpoint
		*
		* @param {Object}		response		contains data array with product information to populate deal cards with.
		* @param {Number}		cardNumber		the card to populate the information 			
		* @param {Number}		dataEntry		the entry in the data array to populate the cards with.
		*/
		populateDeals: function (response, cardNumber, dataEntry) {
			// there will already be one card on the page, so for subsequent data entries, create a card before populating
			if (cardNumber !== 0) {
				RatesDealsHandler.createNewCard();
			}
			// make the first card on the page visible
			$('.deal-card')[0].style.display = "block";

			// set product URL
			$('.deal-link')[cardNumber].href = response.data[dataEntry].listing.merchantURL;

			// set product image
			$('.deal-img')[cardNumber].src = response.data[dataEntry].images[0];

			// set merchant of product and change it to Title case
			$('.merchant')[cardNumber].innerHTML = "at " + RatesDealsHandler.toTitleCase(response.data[dataEntry].listing.merchant);

			// set deal title 
			const dealTitle = $('.deal-item-title')[cardNumber];
			dealTitle.innerHTML = response.data[dataEntry].name;
			// if deal title is too long, clamp it to show ellipsis
			RatesDealsHandler.clamp(dealTitle);

			/*
			* commented out for now, may be needed for activity feed in the future
			//set how long ago deal was posted
			document.getElementsByClassName("deal-posted-date")[cardNumber].innerHTML = getTimeAgo(response.data[dataEntry].lastCreated);
			*/

			// set current price with correct currency
			$('.current-price')[cardNumber].innerHTML = RatesDealsHandler.getCurrency(response.data[dataEntry]) + RatesDealsHandler.round(response.data[dataEntry].listing.currentPrice, 2);

			// set savings with correct currency and decimal format
			if (response.data[dataEntry].listing.previousPrice !== "") {
				// if there are savings, calculate and set
				$('.save-container')[cardNumber].lastChild.style.visibility = 'visible';
				$('.prices-container')[cardNumber].lastChild.style.visibility = 'visible';
				$('.amount-saved')[cardNumber].innerHTML = RatesDealsHandler.getCurrency(response.data[dataEntry]) + RatesDealsHandler.calculateSavings(response.data[dataEntry]);
			}
			else {
				// if no savings, hide savings related elements
				$('.save-container')[cardNumber].lastChild.style.visibility = 'hidden';
				$('.prices-container')[cardNumber].lastChild.style.visibility = 'hidden';
			}
		},
		/**
		* Populate modal with product information fetched from RateS endpoint
		*
		* @param {Object}		response		contains data array with product information to populate deal cards with.
		*/
		populateModal: function (response) {
			// set product image
			$('.product-img')[0].srcset = response.data.images[0];

			// set product URL
			$('.see-deal-button')[0].href = response.data.listing.merchantURL;

			// set merchant of product and change it to Title case
			$('.product-merchant')[0].innerHTML = "at " + RatesDealsHandler.toTitleCase(response.data.listing.merchant);

			// set deal title 
			const dealTitle = $('.product-title')[0];
			dealTitle.innerHTML = response.data.name;
			// if deal title is too long, clamp it to show ellipsis
			RatesDealsHandler.clamp(dealTitle);

			// set current price with correct currency
			$('.product-price-currency')[0].innerHTML = RatesDealsHandler.getCurrency(response.data);
			$('.product-price')[0].innerHTML = response.data.listing.currentPrice.substring(0, response.data.listing.currentPrice.indexOf('.'));
			$('.product-price-decimal')[0].innerHTML = response.data.listing.currentPrice.substring(response.data.listing.currentPrice.indexOf('.'));

			// set previous price with correct currency, if previous price does not exist, hide element
			if (response.data.listing.previousPrice !== "") {
				$('.product-prev-price')[0].style.visibility = "visible";
				$('.product-prev-price')[0].innerHTML = RatesDealsHandler.getCurrency(response.data) + response.data.listing.previousPrice;
			} else {
				$('.product-prev-price')[0].style.visibility = "hidden";
			}

			// set product description
			$('.product-details')[0].innerHTML = response.data.description.replace(/\n/g, "<br />");
			$('.product-details-container')[0].style.overflowX = "hidden";
		},
		/**
		* Fetch deals from RateS endpoint and populate Deals page with them
		*
		* @param {String}		filter		the parameters to request from RateS endpoint
		*/
		getDeals: function (filter) {
			// sets isFetchingDeals to true to prevent multiple triggers
			Config.isFetchingDeals = true;

			$.ajax({
				method: 'GET',
				url: 'https://ratex.co/store/api/products' + '?filter=' + filter
			})

				// takes the data array from response and populate each new card with the information of each entry in this array
				.done(function (response) {
					// sets address bar with parameters
					window.history.pushState({ urlPath: '/deals-copy?category=' + Config.currentCategory }, "", '/deals-copy?category=' + Config.currentCategory);

					// make first card on page visible
					Config.dealsContainer.firstChild.style.display = 'block';

					// create and populate cards with information from the data array
					let dataEntry = 0;
					for (cardNumber = Config.offset; dataEntry < response.data.length && Config.hasMore; cardNumber++ , dataEntry++) {
						RatesDealsHandler.populateDeals(response, cardNumber, dataEntry);
					}
					// checks if there are more deals that can be loaded for infinite scroll
					Config.hasMore = response.hasMore;

					// updates offset to load the next batch of cards for infinite scroll
					Config.offset += response.data.length;

					// set isFetchingDeals to false so infinite scroll can fetch next batch if triggered
					Config.isFetchingDeals = false;
				})
		},
		/**
		* Fetch deal from RateS endpoint and populate the product modal with them
		*
		* @param {String}		productId		the id of the product to request from RateS endpoint
		*/
		getProductModal: function (productId) {

			$.ajax({
				method: 'GET',
				url: 'https://ratex.co/store/api/products/' + productId
			})

				// takes the product data from response and populate modal with it
				.done(function (response) {

					// check that it is a valid productId
					if (response.data.id !== productId) {
						// error
						RatesDealsHandler.toggleError();
					} else {

						// sets address bar with parameters
						window.history.pushState({ urlPath: '/deals-copy?productId=' + productId }, "", '/deals-copy?productId=' + productId);

						// add listener to disable scroll
						window.addEventListener('scroll', RatesDealsHandler.noscroll);

						// display modal
						RatesDealsHandler.toggleModal();

						// populate data
						RatesDealsHandler.populateModal(response);
					}

				})
		},
		/**
		* Parses address entered to return parameters
		*
		* @param {String}		query		the address to retrieve parameters from
		* @returns {String}		the parameters in the address
		*/
		parse_query_string: function (query) {
			const vars = query.split("&");
			const query_string = {};
			let m = 0;
			for (m = 0; m < vars.length; m++) {
				let pair = vars[m].split("=");
				// If first entry with this name
				if (typeof query_string[pair[0]] === "undefined") {
					query_string[pair[0]] = decodeURIComponent(pair[1]);
					// If second entry with this name
				} else if (typeof query_string[pair[0]] === "string") {
					let arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
					query_string[pair[0]] = arr;
					// If third or later entry with this name
				} else {
					query_string[pair[0]].push(decodeURIComponent(pair[1]));
				}
			}
			return query_string;
		},
		/**
		* If category in address is not 'Daily', set the respective category tab as active
		*/
		setCurrentButton: function () {
			$('.daily-button')[0].classList.remove("w--current");
			if (Config.currentCategory === "Price Drops") {
				$('.price-drop-button')[0].classList.add("w--current");
			}
			else if (Config.currentCategory === "Popular") {
				$('.popular-button')[0].classList.add("w--current");
			}
			else {
				$('.daily-button')[0].classList.add("w--current");
			}
		},
		/**
		* get parameters from address, then get deals from the category specified in parameters
		*/
		initiate: function () {
			const query = window.location.search.substring(1);
			const qs = RatesDealsHandler.parse_query_string(query);

			// check for specified category to display
			if (qs.category !== undefined) {
				Config.currentCategory = qs.category;
			}
			RatesDealsHandler.setCurrentButton();
			RatesDealsHandler.getDeals(Config.currentCategory);

			// check for specified product to display
			if (qs.productId !== undefined) {
				const ua = window.navigator.userAgent;
				// Detect if user is on iOS
				const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i) || !!ua.match(/iPod/i);
				const webkit = !!ua.match(/WebKit/i);
				// Detect if user is currently using safari web browser
				const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
				// if yes, check for cookie
				if (iOSSafari) { // if in safari
					var app = {
						launchApp: function () {
							var now = new Date().valueOf();
							setTimeout(function () {
									if (new Date().valueOf() - now > 500) return;
									RatesDealsHandler.app.openWebApp();
							}, 25);
							window.location.replace("exp://8n-s2q.jessidew95.ratex-mobile.exp.direct");
						},

						openWebApp: function () {
							window.location.replace("itms-apps://itunes.apple.com/sg/app/rates-mobile-app-by-ratex/id1350096340?mt=8");
						}
					};

					app.launchApp();
					RatesDealsHandler.getProductModal(parseInt(qs.productId));
				}
				else if (ua.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) { // if in other mobile browsers
					var app = {
						launchApp: function () {
							window.location.replace("exp://8n-s2q.jessidew95.ratex-mobile.exp.direct");
							this.timer = setTimeout(this.openWebApp, 1000);
						},
					};

					app.launchApp();
					RatesDealsHandler.getProductModal(parseInt(qs.productId));
				}
				else { // if on desktop
					RatesDealsHandler.getProductModal(parseInt(qs.productId));
				}
			}
		}
	};

	//infinite scroll
	window.onscroll = function (ev) {
		// triggers when user scrolls past a certain window height
		if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight / 1.4)) {
			if (!Config.isFetchingDeals && Config.hasMore) {
				RatesDealsHandler.getDeals(Config.currentCategory + '&offset=' + Config.offset.toString());
			}
		}
	};

	//Buttons
	$('.daily-button')[0].addEventListener("click", function () {
		// reset feed to remove all cards currently on page
		RatesDealsHandler.resetFeed();
		Config.currentCategory = 'Daily'
		RatesDealsHandler.getDeals(Config.currentCategory);

	});

	$('.price-drop-button')[0].addEventListener("click", function () {
		RatesDealsHandler.resetFeed();
		Config.currentCategory = 'Price Drops'
		RatesDealsHandler.getDeals(Config.currentCategory);
	});

	$('.popular-button')[0].addEventListener("click", function () {
		RatesDealsHandler.resetFeed();
		Config.currentCategory = 'Popular'
		RatesDealsHandler.getDeals(Config.currentCategory);
	});

	$(".product-close-button")[0].addEventListener("click", function () {
		// close modal
		RatesDealsHandler.toggleModal();

		// update address bar
		window.history.pushState({ urlPath: '/deals-copy?category=daily' }, "", '/deals-copy?category=daily');

		// Remove listener to disable scroll
		window.removeEventListener('scroll', RatesDealsHandler.noscroll);
	});

	$(".error-close-button")[0].addEventListener("click", function () {
		// close alert
		RatesDealsHandler.toggleError();

		// update address bar
		window.history.pushState({ urlPath: '/deals-copy?category=daily' }, "", '/deals-copy?category=daily');

		// Remove listener to disable scroll
		window.removeEventListener('scroll', RatesDealsHandler.noscroll);
	});

	// When users press back, reinitiate
	window.addEventListener('popstate', function (event) {

		RatesDealsHandler.initiate();

	}, false);

	RatesDealsHandler.initiate();
});

/* This file is used for https://rate.com.sg/rates/deals
 * Functionalities of this files include -
   * API calls to get deals
   * Clone similar cards to the default style, and populate the list
   * Handles the current category (Latest, Popular, Price Drop)
   * Handles infinite scrolling
   * 'Clamps' the Product Name so that it's only 2 lines
 * This is then loaded into the webpage through a script tag pointing to the cdn.rawgit of this file
*/

// On document ready
$(function () {

	let Parser = document.createElement('a');

	// initialize to desktop mode with no search and 'Latest' category
	let Config = {
		// deal containers must follow the same deal component classes to be filled by populateDeals
		allDealsContainers: [document.getElementsByClassName("deals-container")[0], document.getElementsByClassName("deals-container mobile")[0]],
		dealsContainer: document.getElementsByClassName("deals-container")[0],
		mobile: false,
		currentCategory: 'Latest',
		offset: 0,
		hasMore: 'true',
		isFetchingDeals: false,
		search: false,
		searchText: "",
		baseURL: "https://ratex.co"
	};

	let RatesDealsHandler = {
		/**
		* Creates a new product card for all deal containers
		*/
		createNewCard: function () {
			for (var i = 0; i < Config.allDealsContainers.length; i++) {
				var newCard = Config.allDealsContainers[i].firstElementChild.cloneNode(true);
				Config.allDealsContainers[i].appendChild(newCard);
			}

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

			// change style.display is more efficient and reliable than style.visibility
			// assuming we are okay with the component space disappearing
			Config.dealsContainer.style.display = 'none';

			Config.offset = 0;
			Config.hasMore = true;

			// Clear data of first card
			// set product URL
			document.getElementsByClassName("deal-link")[0].href = '';

			// set product image
			document.getElementsByClassName("deal-img")[0].src = 'https://uploads-ssl.webflow.com/img/image-placeholder.svg';

			// set merchant of product and change it to Title case
			document.getElementsByClassName("merchant")[0].innerHTML = 'Merchant';

			// set deal title
			const dealTitle = document.getElementsByClassName("deal-item-title")[0];
			dealTitle.innerHTML = 'Name'

			// set price
			document.getElementsByClassName("current-price")[0].innerHTML = 'Price';

			// set savings
			document.getElementsByClassName("amount-saved")[0].innerHTML = 'Savings'

			for (var i = 0; i < Config.allDealsContainers.length; i++) {
				for (var j = Config.allDealsContainers[i].getElementsByClassName("deal-card").length; j > 1; j--) {
					Config.allDealsContainers[i].removeChild(Config.allDealsContainers[i].lastChild);
				}
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
			// There will already be one card on the page, so for subsequent data entries, create a card before populating
			// This is the part where it creates 1 card per deals-cotainer
			if (cardNumber !== 0) {
				RatesDealsHandler.createNewCard();
			}

			// Currently there are two deal containers. Two cards are added per populateDeals()
			// We want to update the second container's card at index cardNumber as well
			// If this goes beyond two containers to n containers, we might need to use map or make sure we clone
			// from 1 container only so that we can call populateDeals	n time
			var secondCardNumber = document.getElementsByClassName("deal-link").length/2 + cardNumber

			// set product URL
			document.getElementsByClassName("deal-link")[cardNumber].href = response.data[dataEntry].listing.merchantURL;
			document.getElementsByClassName("deal-link")[secondCardNumber].href = response.data[dataEntry].listing.merchantURL;

			// set product image
			document.getElementsByClassName("deal-img")[cardNumber].src = response.data[dataEntry].images[0];
			document.getElementsByClassName("deal-img")[secondCardNumber].src = response.data[dataEntry].images[0];

			// set merchant of product and change it to Title case
			document.getElementsByClassName("merchant")[cardNumber].innerHTML = RatesDealsHandler.toTitleCase(response.data[dataEntry].listing.merchant);
			document.getElementsByClassName("merchant")[secondCardNumber].innerHTML = RatesDealsHandler.toTitleCase(response.data[dataEntry].listing.merchant);

			// set deal title
			const dealTitle = document.getElementsByClassName("deal-item-title")[cardNumber];
			dealTitle.innerHTML = response.data[dataEntry].name;
			// if deal title is too long, clamp it to show ellipsis
			RatesDealsHandler.clamp(dealTitle);

			// set deal title
			const dealTitle2 = document.getElementsByClassName("deal-item-title")[secondCardNumber];
			dealTitle2.innerHTML = response.data[dataEntry].name;
			// if deal title is too long, clamp it to show ellipsis
			RatesDealsHandler.clamp(dealTitle2);

			/*
			* commented out for now, may be needed for activity feed in the future
			//set how long ago deal was posted
			getElementsByClassName("deal-posted-date")[cardNumber].innerHTML = getTimeAgo(response.data[dataEntry].lastCreated);
			*/

			// set current price with correct currency
			document.getElementsByClassName("current-price")[cardNumber].innerHTML = RatesDealsHandler.getCurrency(response.data[dataEntry]) + RatesDealsHandler.round(response.data[dataEntry].listing.currentPrice, 2);
			document.getElementsByClassName("current-price")[secondCardNumber].innerHTML = RatesDealsHandler.getCurrency(response.data[dataEntry]) + RatesDealsHandler.round(response.data[dataEntry].listing.currentPrice, 2);

			// set savings with correct currency and decimal format
			if (response.data[dataEntry].listing.previousPrice !== "") {
				// if there are savings, calculate and set visbility to inherit
				// Prevents savings to be shown when deal card supposed to be hidden
				document.getElementsByClassName("save-container")[cardNumber].lastChild.style.visibility = 'inherit';
				document.getElementsByClassName("prices-container")[cardNumber].lastChild.style.visibility = 'inherit';
				document.getElementsByClassName("amount-saved")[cardNumber].innerHTML = RatesDealsHandler.getCurrency(response.data[dataEntry]) + RatesDealsHandler.calculateSavings(response.data[dataEntry]);

				document.getElementsByClassName("save-container")[secondCardNumber].lastChild.style.visibility = 'inherit';
				document.getElementsByClassName("prices-container")[secondCardNumber].lastChild.style.visibility = 'inherit';
				document.getElementsByClassName("amount-saved")[secondCardNumber].innerHTML = RatesDealsHandler.getCurrency(response.data[dataEntry]) + RatesDealsHandler.calculateSavings(response.data[dataEntry]);
			}
			else {
				// if no savings, hide savings related elements
				document.getElementsByClassName("save-container")[cardNumber].lastChild.style.visibility = 'hidden';
				document.getElementsByClassName("prices-container")[cardNumber].lastChild.style.visibility = 'hidden';

				// if no savings, hide savings related elements
				document.getElementsByClassName("save-container")[secondCardNumber].lastChild.style.visibility = 'hidden';
				document.getElementsByClassName("prices-container")[secondCardNumber].lastChild.style.visibility = 'hidden';
			}
		},
		/**
		* Fetch deals from RateS endpoint and populate Deals page with them
		*
		* @param {String}		filter		the parameters to request from RateS endpoint
		*/
		getDeals: function (filter) {
			// sets isFetchingDeals to true to prevent multiple triggers
			Config.isFetchingDeals = true;

			var offsetOpts = ""
			if (Config.offset > 0) {
					offsetOpts = '&offset=' + encodeURIComponent(Config.offset)
			}

			var hostOpts = ""
			if (Config.baseURL !== "https://ratex.co") {
					hostOpts = "&host=" + encodeURIComponent("Config.baseURL");
			}

			$.ajax({
				method: 'GET',
				url: RatesDealsHandler.joinPath('/store/api/products') + '?filter=' + filter + offsetOpts
			})

				// takes the data array from response and populate each new card with the information of each entry in this array
				.done(function (response) {
					// sets address bar with parameters
					var path = "/find?category=" + Config.currentCategory + hostOpts
					if (window.history.state === null) {
						window.history.pushState({
							urlPath: path
						},
							 "", path);
					} else if (window.history.state.urlPath !== path) {
						window.history.pushState({
							urlPath: path
						},
							 "", path);
					}

					var dataEntry = 0;
					for (var cardNumber = Config.offset; dataEntry < response.data.length && Config.hasMore; cardNumber++ , dataEntry++) {
						RatesDealsHandler.populateDeals(response, cardNumber, dataEntry);
					}

					document.getElementById("resultsText").textContent = `${Config.currentCategory}`
					document.getElementById("resultsCount").style.display = 'none';
					document.getElementById("resultsCount").textContent = '';
					document.getElementById("searchbar").value = "";

					// checks if there are more deals that can be loaded for infinite scroll
					Config.hasMore = response.hasMore;

					// updates offset to load the next batch of cards for infinite scroll
					Config.offset += response.data.length;

					// set isFetchingDeals to false so infinite scroll can fetch next batch if triggered
					Config.isFetchingDeals = false;

					// make deals visible only if there are (previous) results
					if (Config.offset !== 0 || response.data.length !== 0 ) {
						Config.dealsContainer.style.display = 'flex';
					}
				})
		},

		/**
		* Search deals from RateS endpoint and populate Deals page with them
		*
		* @param {String}		filter		the search text to pass to RateS endpoint
		*/
		searchDeals: function (filter) {
			if (Array.isArray(filter)) {
					filter = filter.join(" ")
			}

			filter = filter.toLowerCase();

			// sets isFetchingDeals to true to prevent multiple triggers
			Config.isFetchingDeals = true;

			var offsetOpts = ""
			if (Config.offset > 0) {
					offsetOpts = '&offset=' + encodeURIComponent(Config.offset);
			}

			var hostOpts = ""
			if (Config.baseURL !== "https://ratex.co") {
					hostOpts = "&host=" + encodeURIComponent(Config.baseURL);
			}

			$.ajax({
				method: 'GET',
				url: RatesDealsHandler.joinPath('/store/api/products/search') + '?filter=' + filter + offsetOpts
			})

				// takes the data array from response and populate each new card with the information of each entry in this array
				.done(function (response) {
					// set the search query value in the search bar and results
					RatesDealsHandler.setQuery(Config.searchText);

					// create and populate cards with information from the data array

					var dataEntry = 0;
					for (var cardNumber = Config.offset; dataEntry < response.data.length && Config.hasMore; cardNumber++ , dataEntry++) {
							RatesDealsHandler.populateDeals(response, cardNumber, dataEntry);
					}

					// checks if there are more deals that can be loaded for infinite scroll
					Config.hasMore = response.hasMore;

					// updates offset to load the next batch of cards for infinite scroll
					Config.offset += response.data.length;

					// set isFetchingDeals to false so infinite scroll can fetch next batch if triggered
					Config.isFetchingDeals = false;

					// update search count
					RatesDealsHandler.renderQueryCount(response.count);

					// make deals visible only if there are (previous) results
					if (Config.offset !== 0 || response.data.length !== 0 ) {
						Config.dealsContainer.style.display = 'flex';

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
			query = query.replace(/\+/g, '%20')
			query = query.replace(/\?/g, '')
			const vars = query.split("&");
		        const query_string = {};

			for (var m = 0; m < vars.length; m++) {
				var pair = vars[m].split("=");
				// If first entry with this name
				if (typeof query_string[pair[0]] === "undefined") {
					query_string[pair[0]] = decodeURIComponent(pair[1]);
					// If second entry with this name
				} else if (typeof query_string[pair[0]] === "string") {
					var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
					query_string[pair[0]] = arr;
					// If third or later entry with this name
				} else {
					query_string[pair[0]].push(decodeURIComponent(pair[1]));
				}
			}
			return query_string;
		},

		/**
		* Concat base URL and path
		*
		* @param {String}		path	A USVString representing an absolute or relative URL.
		 If url is a relative URL, Config.base will be used
		 If url is an absolute URL, a given base will be ignored.
		* @returns {String}		the result URL string
		*/
		joinPath: function (path) {
			if (Config.baseURL[Config.baseURL.length-1] === '/') {
				Config.baseURL = Config.baseURL.substring(0, -1);
			}

			if (path[0] === '/') {
				path = path.substring(1);
			}
			return Config.baseURL+ '/' + path;
		},
		/**
		* If category in address is not 'Latest', set the respective category tab as active
		*/
		setCurrentButton: function () {
			document.getElementsByClassName("latest-button")[0].classList.remove("w--current");
			if (Config.currentCategory === "PriceDrop") {
				document.getElementsByClassName("price-drop-button")[0].classList.add("w--current");
			}
			else if (Config.currentCategory === "Popular") {
				document.getElementsByClassName("popular-button")[0].classList.add("w--current");
			}
			else {
				document.getElementsByClassName("latest-button")[0].classList.add("w--current");
			}
		},


		/**
		* setQuery
		* 1. replaces all instances of q search parameter (even blank ones)
		* with provided query string
		* 2. Updates search bar text value
		* 3. Updates results meta header text
		* https://ratex.store/find?category=Latest&q=&q=&q=&q=&q=&q=&q=&q=iphone
		* https://ratex.store/find?category=Latest&q=&q=&q=&q=&q=&q=&q=&q=&q=
		*/
		setQuery: function (query) {

			var hostOpts = ""
			if (Config.baseURL !== "https://ratex.co") {
					hostOpts = "&host=" + encodeURIComponent(Config.baseURL);
			}

			Config.search = true
			Config.searchText = query

			// update url query paramter for q only and remove duplicate q
			// Note: there is a simplier way without regex: parse query and then unparse it
			var search = window.location.search

			// remove category parameters
			search = search.replace(/category=.*&/g, "")
			var regex = /[?;&]?(q=[^&#]*)[&;#]?/g;
			var first = "", second = "", start = 0
			while ((matches = regex.exec(search)) !== null) {
				if (regex.lastIndex === 0 || regex.lastIndex === search.length) {
					var regex2 = /(q=[^&#]*)\b/g;
					search = search.replace(regex2, "q="+decodeURIComponent(Config.searchText));
				} else {
					first = search.substring(start, regex.lastIndex).replace(/q=[^&#]*&?/g, "");
					second = search.substring(regex.lastIndex)
					search = first + second
					start = regex.lastIndex;
				}
			}

			if (!regex2) {
					if (search.length > 0) {
						search = search + "&q=" + decodeURIComponent(Config.searchText);
					} else {
						search = "?q=" + decodeURIComponent(Config.searchText);
					}
			}

			var path = "/find" + "?q=" + query + hostOpts
			if (window.history.state === null) {
				window.history.pushState({
					urlPath: path
				},
					 "", path);
			} else if (window.history.state.urlPath !== path) {
				window.history.pushState({
					urlPath: path
				},
					 "", path);
			}


			document.getElementById("searchbar").value = Config.searchText
			document.getElementById("resultsText").textContent = `Search Results for "${Config.searchText}"`
		},

		renderQueryCount: function (count) {
			document.getElementById("resultsCount").textContent = `${count} results`;
			document.getElementById("resultsCount").style.display = 'block';
		},
		/**
		*  if dimensions are mobile, hide non-mobile and display mobile version
		*  of deals container. We also swap the pointer
		*/
		resize: function () {
			if (window.innerWidth < 700 && !Config.mobile) {
				Config.dealsContainer.style.display = 'none';
				Config.dealsContainer = Config.allDealsContainers[1];
				Config.dealsContainer.style.display = 'flex';
				Config.mobile = true;
			} else if (window.innerWidth >= 700 && Config.mobile){
				Config.dealsContainer.style.display = 'none';
				Config.dealsContainer = Config.allDealsContainers[0];
				Config.dealsContainer.style.display = 'flex';
				Config.mobile = false;
			}
		},

		/**
		* get parameters from address, then get deals from the category specified in parameters
		*/
		initiate: function () {
			RatesDealsHandler.resetFeed();
			RatesDealsHandler.resize();
			const query = window.location.search.substring(1);
			const qs = RatesDealsHandler.parse_query_string(query);

			// Look for host variable first before calling endpoints
			if (qs.host && qs.host.length > 0) {
				Config.baseURL = qs.host;
			}

			// Either search or getDeals, search gets priority
			// Defaults to latest
			if (qs.q && qs.q.length > 0) {
				Config.searchText = qs.q;
				RatesDealsHandler.searchDeals(Config.searchText);
			} else if (qs.category && qs.category.length > 0) {
				Config.currentCategory = qs.category;
				RatesDealsHandler.setCurrentButton();
				RatesDealsHandler.getDeals(Config.currentCategory);
			} else {
				RatesDealsHandler.setCurrentButton();
				RatesDealsHandler.getDeals(Config.currentCategory);
			}
		}
	};

	//infinite scroll
	window.onscroll = function (ev) {
		// triggers when user scrolls past a certain window height
		if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight / 1.4)) {
			if (!Config.isFetchingDeals && Config.hasMore) {
				if (Config.search) {
					RatesDealsHandler.searchDeals(Config.searchText);
				} else {
					RatesDealsHandler.getDeals(Config.currentCategory);
				}
			}
		}
	};

	//treat state change as a refresh in content
	window.onpopstate = function(event) {
		RatesDealsHandler.initiate();
	};

	// mobilze resizing but with a separate deals container to support structural differences

	// from https://developer.mozilla.org/en-US/docs/Web/Events/resize
	var optimizedResize = (function() {

	  var callbacks = [],
	      running = false;

	  // fired on resize event
	  function resize() {
	    if (!running) {
	      running = true;
	      if (window.requestAnimationFrame) {
	        window.requestAnimationFrame(runCallbacks);
	      } else {
	        setTimeout(runCallbacks, 66);
	      }
	    }
	  }

	  // run the actual callbacks
	  function runCallbacks() {
	    callbacks.forEach(function(callback) {
	      callback();
	    });

	    running = false;
	  }

	  // adds callback to loop
	  function addCallback(callback) {
	    if (callback) {
	      callbacks.push(callback);
	    }
	  }

	  return {
	    // public method to add additional callback
	    add: function(callback) {
	      if (!callbacks.length) {
	        window.addEventListener('resize', resize);
	      }
	      addCallback(callback);
	    }
	  }

	}());

	//Buttons
	document.getElementsByClassName("latest-button")[0].addEventListener("click", function () {
		// reset feed to remove all cards currently on page
		RatesDealsHandler.resetFeed();
		Config.currentCategory = 'Latest'
		Config.search = false
		RatesDealsHandler.getDeals(Config.currentCategory);

	});

	document.getElementsByClassName("price-drop-button")[0].addEventListener("click", function () {
		RatesDealsHandler.resetFeed();
		Config.currentCategory = 'PriceDrop'
		Config.search = false
		RatesDealsHandler.getDeals(Config.currentCategory);
	});

	document.getElementsByClassName("popular-button")[0].addEventListener("click", function () {
		RatesDealsHandler.resetFeed();
		Config.currentCategory = 'Popular'
		Config.search = false
		RatesDealsHandler.getDeals(Config.currentCategory);
	});

	RatesDealsHandler.initiate();

	// start listing to resize
	optimizedResize.add(RatesDealsHandler.resize);


	// Search components

	$('#search').submit((e) => {
			e.preventDefault();
			if (document.getElementById("searchbar") && document.getElementById("searchbar").value.length > 0) {
				Config.searchText = document.getElementById("searchbar").value;
				RatesDealsHandler.resetFeed();
				RatesDealsHandler.searchDeals(Config.searchText);
			}
	});

});

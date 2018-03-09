// On document ready
$(function () {

	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://s.cdpn.io/3/clamp.js';
	document.head.appendChild(script);

	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment-with-locales.js';
	document.head.appendChild(script);

	let dealsContainer = document.getElementsByClassName("deals-container")[0];
	const currentCategory = 'Daily';
	const offset = 0;
	const hasMore = true;
	const isFetchingDeals = false;

	//Buttons
	document.getElementsByClassName("daily-button")[0].addEventListener("click", function() {
		// reset feed to remove all cards currently on page
		resetFeed();
		currentCategory = 'Daily'
		getDeals(currentCategory);

	});

	document.getElementsByClassName("price-drop-button")[0].addEventListener("click", function() {
		resetFeed();
		currentCategory = 'PriceDrop'
		getDeals(currentCategory);
	});

	document.getElementsByClassName("popular-button")[0].addEventListener("click", function() {
		resetFeed();
		currentCategory = 'Popular'
		getDeals(currentCategory);
	});

	/**
   * Creates a new product card
   */
	function createNewCard() {
		let newCard = dealsContainer.firstElementChild.cloneNode(true);
		dealsContainer.appendChild(newCard);
	}

	/**
   * Displays the correct currency format.
   *
   * @param {Object}    deal				Object representation of the deal to format the currency for.
   * @returns {String} 	the formatted currency
   */
	
	function getCurrency(deal) {
		if (deal.listing.currency == "SGD") {
			return "S$";
		}
		else {
			return "$";
		}
	}

	/**
   * Rounds the currency to the specified decimal places
   *
   * @param {Number}    value       Value to be rounded off.
	 * @param {Number}		decimals		Number of decimal places to round off to if decimal places exist.
   * @returns {Number} Savings, rounded to 2 d.p if decimal numbers exist, else rounded to 0 d.p.
   */
	function round(value, decimals) {
		const savings = Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		if (savings % 1.00 > 0) { // if there are decimals, display with 2 decimal places
			return savings.toFixed(2);
		}
		else { // if there are no decimals, do not display decimal places
			return savings;
		}
	}

	/**
   * Calculate savings for the deal based on current and previous price
   *
   * @param {Object}    deal				Object representation of the deal to calculate savings for.
   * @returns {Number} Savings, rounded to 2 d.p if decimal numbers exist, else rounded to 0 d.p.
   */
	function calculateSavings(deal) {
		const savings = parseFloat(deal.listing.previousPrice) - parseFloat(deal.listing.currentPrice);
		return round(savings, 2); // more accurate rounding method
	}

	/**
   * Add ellipsis where product name cuts off
   *
   * @param {Object}    dealTitle         Object representation of the deal to add ellipsis to.
   */
	function clamp(dealTitle) {
		$clamp(dealTitle, {clamp: 2});
	}

	/* can be used for activities feed in future
	function getTimeAgo(lastCreated) {
		const date = lastCreated.substring(0, 10);
		date = date.replace(/-/g, "");
		date = date + ", " + lastCreated.substring(11, 16);

		return moment(date, "YYYYMMDD, hh:mm").fromNow();

	}*/

	/**
   * Change the string to title case
   *
   * @param {String}    str				the String object to be changed to title case
   * @returns {String} 	the string that has been formatted to title case
   */
	function toTitleCase(str)
	{
			return str.replace(/\w\S*/g, 
				function(txt){
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
	}

	/**
   * Removes all existing card except the first one, hides the first one
   */
	function resetFeed() {
		offset = 0;
		hasMore = true;
		dealsContainer.firstChild.style.visibility='hidden';
		const j = 0;
		for (j = document.getElementsByClassName("deal-card").length; j > 1; j--) {
			dealsContainer.removeChild(dealsContainer.lastChild);
		}
	}

	// do API call, populate cards with deal info

	/**
   * Fetch deals from RateS endpoint and populate Deals page with them
   *
   * @param {String}    filter				the parameters to request from RateS endpoint
   */
	function getDeals(filter) {
		// sets isFetchingDeals to true to prevent multiple triggers
		isFetchingDeals = true;

		$.ajax ({
			method: 'GET',
			url: 'https://ratex.co/store/api/products' + '?filter=' + filter
		})

		// takes the data array from response and populate each new card with the information of each entry in this array
		.done(function (response) {
			// sets address bar with parameters
			window.history.pushState({urlPath:'/trending-deals-rates?category=' + currentCategory},"",'/trending-deals-rates?category=' + currentCategory);
			
			// make first card on page visible
			dealsContainer.firstChild.style.visibility='visible';
			
			const startOfData = 0;
			for(i = offset; startOfData < response.data.length && hasMore; i++, startOfData++) {
				if (i !== startOfData) {
					createNewCard();
				}
				// set product URL
				document.getElementsByClassName("deal-link")[i].href = response.data[startOfData].listing.merchantURL;
				
				// set product image
				document.getElementsByClassName("deal-img")[i].src = response.data[startOfData].images[0];
				
				// set merchant of product and change it to Title case
				document.getElementsByClassName("merchant")[i].innerHTML = "at " + toTitleCase(response.data[startOfData].listing.merchant);

				// set deal title 
				const dealTitle = document.getElementsByClassName("deal-item-title")[i];
				dealTitle.innerHTML = response.data[startOfData].name;
				clamp(dealTitle); // if deal title is too long, clamp it to show ellipsis
				
				// set how long ago deal was posted
				// commented out for now, may be needed for activity feed in the future
				//document.getElementsByClassName("deal-posted-date")[i].innerHTML = getTimeAgo(response.data[startOfData].lastCreated);
				
				// set current price with correct currency
				document.getElementsByClassName("current-price")[i].innerHTML = getCurrency(response.data[startOfData]) + round(response.data[startOfData].listing.currentPrice, 2);
				
				// set savings with correct currency
				if (response.data[startOfData].listing.previousPrice !== "") { // if there are savings, calculate and set
					document.getElementsByClassName("save-container")[0].lastChild.style.visibility='visible';
					document.getElementsByClassName("prices-container")[0].lastChild.style.visibility='visible';
					document.getElementsByClassName("amount-saved")[i].innerHTML = getCurrency(response.data[startOfData]) + calculateSavings(response.data[startOfData]);
				}
				else { // if no savings, hide savings related elements
					document.getElementsByClassName("save-container")[0].lastChild.style.visibility='hidden';
					document.getElementsByClassName("prices-container")[0].lastChild.style.visibility='hidden';
				}

				// to account for first card already on the page
				if (i < response.data.length - 1) {
					createNewCard();
				}
			}
			// checks if there are more deals that can be loaded for infinite scroll
			hasMore = response.hasMore;

			// updates offset to load the next batch of cards for infinite scroll
			offset += response.data.length;

			// set isFetchingDeals to false so infinite scroll can fetch next batch if triggered
			isFetchingDeals = false;
		})
	}

	//infinite scroll
	window.onscroll = function(ev) {
		// triggers when user scrolls past a certain window height
			if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight/1.4)) {
				if (!isFetchingDeals && hasMore) {
					console.log("triggered");
					getDeals(currentCategory + '&offset=' + offset.toString());
				}
			}
	};

	/**
   * Parses address entered to return parameters
   *
   * @param {String}    query				the address to retrieve parameters from
   * @returns {String} 	the parameters in the address
   */
	function parse_query_string(query) {
		const vars = query.split("&");
		const query_string = {};
		for (const i = 0; i < vars.length; i++) {
			const pair = vars[i].split("=");
			// If first entry with this name
			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
				// If second entry with this name
			} else if (typeof query_string[pair[0]] === "string") {
				const arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
				query_string[pair[0]] = arr;
				// If third or later entry with this name
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		}
		return query_string;
	}

	/**
   * If category in address is not 'Daily', set the respective category tab as active
   */
	function setCurrentButton() {
		document.getElementsByClassName("daily-button")[0].classList.remove("w--current");
		if (currentCategory === "PriceDrop") {
			document.getElementsByClassName("price-drop-button")[0].classList.add("w--current");
		}
		else if (currentCategory === "Popular"){
			document.getElementsByClassName("popular-button")[0].classList.add("w--current");
		}
		else {
			document.getElementsByClassName("daily-button")[0].classList.add("w--current");
		}
	}

	// checks the category in address then gets deals from that category
	const query = window.location.search.substring(1);
	const qs = parse_query_string(query);
	if(qs.category !== undefined) {
		currentCategory = qs.category;
	}
	setCurrentButton();
	getDeals(currentCategory);
});

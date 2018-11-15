/* Usage:
  const ratexDealsPage = new RatexDealsPage();
  ratexDealsPage.setupPage(); // Runs and populates deals and data for this page.
*/

// Main/Parent/Driver function
class RatexDealsPage {
  constructor() {
    // Init child classes
    this.featuredDeals = new FeaturedDeals(4);
  }
  setupPage() {
    this.featuredDeals.populateDeals();
  }
}


class FeaturedDeals {
  constructor(numberOfDeals) {
    this.numberOfDeals = numberOfDeals;
    this.url = 'https://ratex.co/store/api/products?filter=Activities&limit=4';
    this.featuredDealsParentContainer = $('.deal-wrapper')[0]
  }
  clearOutAllExistingDeals() {
    this.featuredDealsParentContainer.innerHTML = "";
  }
  populateDeals() {
    $.get(this.url)
      .then((response) => {
        if (response && response.data) {
          // Clear out old doms
          this.clearOutAllExistingDeals();
          // Create deal cells
          const deals = response.data;
          deals.forEach(data => {
            const deal = new DealCell(
              data.images[0],
              data.listing.currentPrice,
              data.listing.previousPrice,
              data.listing.merchant,
              data.hot,
              data.name,
              data.listing.merchantURL,
            );
            $(this.featuredDealsParentContainer).append(deal.getDomElement())
          });
        }
      });
  }
}

// Individual deal cell
class DealCell {
  constructor(imageUrl, currentPrice, previousPrice, merchant, hot, name, itemUrl) {
    this.imageUrl = imageUrl;
    this.currentPrice = price;
    this.previousPrice = previousPrice;
    this.percentageDiscount = this.previousPrice ?
      ((this.previousPrice - this.currentPrice) / this.previousPrice) * 100
      : null;
    this.merchant = merchant;
    this.hot = hot;
    this.name = name;
    this.itemUrl = itemUrl;
  }
  constructElement() {
    // Calculate percentage off first
    const percentageDiscount = ((this.previousPrice - this.currentPrice) / this.previousPrice) * 100;
    const newElement = document.createElement("div");
    newElement.classList.add("deal-card-wraper", "full", "w-inline-block", "w-col-tiny-6");
    newElement.onclick = function () { window.open(this.itemUrl); };
    newElement.innerHTML = `
      <img
        class="div-block-249 _2"
        src="${this.imageUrl}"
      >
        <div class="div-block-253">
          ${this.percentageDiscount.toFixed(0)}%
          <br />
          Off
        </div>
      </div>
      <div class="deal-content-wrapper">
          <div class="div-block-252">
            <div class="text-block-189 _1">${this.name}</div>
            <div class="text-block-189 _2">${this.merchant}</div>
          </div>
          <div class="div-block-251"></div>
          <div class="w-clearfix">
            <div class="text-block-189 _3">$${this.currentPrice}</div>
            <div class="text-block-190">$${this.previousPrice.toFixed(2)}</div>
            <div class="text-block-191">${this.hot ? 'HOT' : null}</div>
          </div>
      </div>
    `;
    return newElement;
  }
}

/*
class BlackFridayDeals {
  constructor(numberOfDeals) {
    this.numberOfDeals = numberOfDeals;
    this.url = `https://ratex.co/store/api/products?filter=LATEST&limit=${numberOfDeals}`;
    `https://ratex.co/store/api/categories/${id}?filter=${filter}&limit=${limit}`
    this.page = 1;
    this.hasMore = null;
    // Dom elements
    this.dealsParentContainer = '#deals-parent';
    this.tabContentContainer = '#tab-content-1';
    this.backButtonId = 'deals-custom-back';
    this.nextButtonId = 'deals-custom-next';
  }
  // Basically our driver function
  setUpPage() {
    this.renderPagination(true, false); // Back always disabled on first page
    this.clearOutAllExistingDeals();
    this.populateDeals();
    this.setUpPaginationButtonListeners();
  }
  renderPagination(backDisabled, nextDisabled) {
    // Create Back and Next Buttons
    // Back
    const BackButton = document.createElement("div");
    BackButton.classList.add("w-tab-link");
    BackButton.style.margin = '20px 36px';
    BackButton.style.opacity = (backDisabled) ? 0.6 : 1;
    BackButton.style.cursor = (backDisabled)
      ? 'not-allowed' : 'cursor';
    BackButton.id = this.backButtonId;
    BackButton.innerText = "Back"
    // Next
    const NextButton = document.createElement("div");
    NextButton.style.margin = '20px 36px';
    NextButton.classList.add("w-tab-link");
    NextButton.style.opacity = (nextDisabled) ? 0.6 : 1;
    NextButton.style.cursor = (nextDisabled)
      ? 'not-allowed' : 'cursor';
    NextButton.id = this.nextButtonId;
    NextButton.innerText = "Next"

    // Set up pagination Element
    const PaginationElement = document.createElement("div");
    PaginationElement.style.display = 'flex';
    PaginationElement.style.justifyContent = 'center';
    PaginationElement.append(BackButton);
    PaginationElement.append(NextButton);
    // Add it in
    $(PaginationElement).insertAfter($(this.tabContentContainer));
  }
  populateDeals() {
    $.get(this.url)
      .then((response) => {
        if (response && response.data) {
          // Clear out old doms
          this.clearOutAllExistingDeals();
          // Create deal cells
          const deals = response.data;
          deals.forEach(data => {
            const deal = new DealCell(
              data.images[0],
              data.listing.currentPrice,
              data.listing.merchant,
              data.name,
              data.listing.merchantURL,
            );
            $(this.dealsParentContainer).append(deal.getDomElement())
          });
          this.hasMore = response.hasMore;
          this.toggleNextButtonAvailability(response.hasMore);
        }
      });
  }
  setUpPaginationButtonListeners() {
    $(`#${this.backButtonId}`).click(() => {
      if (this.page > 1) {
        // Update page number
        this.page -= 1;
        // Update url
        this.url = `https://ratex.co/store/api/products?filter=LATEST&limit=${this.numberOfDeals}&offset=${this.numberOfDeals * (this.page - 1)}`;
        // re-populate deals
        this.populateDeals();
        if (this.page === 1) {
          this.toggleBackButtonAvailability(false);
        }
      }
    })
    $(`#${this.nextButtonId}`).click(() => {
      // Update page number
      this.page += 1;
      // Update url
      this.url = `https://ratex.co/store/api/products?filter=LATEST&limit=${this.numberOfDeals}&offset=${this.numberOfDeals * (this.page - 1)}`;
      // re-populate deals
      this.populateDeals();
      this.toggleBackButtonAvailability(true);
    })
  }
  clearOutAllExistingDeals() {
    $(this.dealsParentContainer)[0].innerHTML = "";
  }
  toggleBackButtonAvailability(enabled) {
    const BackButton = document.getElementById(this.backButtonId);
    BackButton.style.opacity = (enabled) ? 1 : 0.6;
    BackButton.style.cursor = (enabled)
      ? 'pointer' : 'not-allowed';
  }
  toggleNextButtonAvailability(enabled) {
    const NextButton = document.getElementById(this.nextButtonId);
    NextButton.style.opacity = (enabled) ? 1 : 0.6;
    NextButton.style.cursor = (enabled)
      ? 'pointer' : 'not-allowed';
  }
}
*/
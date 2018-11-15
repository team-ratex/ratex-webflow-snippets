/* Usage:
  const ratexDealsPage = new RatexDealsPage();
  ratexDealsPage.setupPage(); // Runs and populates deals and data for this page.
*/

// Main/Parent/Driver function
class RatexDealsPage {
  constructor() {
    // Init child classes
    this.featuredDeals = new FeaturedDeals(4);
    this.dealCollections = new DealCollections(20);
    this.featuredDeals.populateDeals();
    this.dealCollections.setupPage();
  }
}


class FeaturedDeals {
  constructor(numberOfDeals) {
    this.numberOfDeals = numberOfDeals;
    this.url = `https://staging.ratex.co/store/api/products?filter=Activities&limit=${this.numberOfDeals}`;
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
            $(this.featuredDealsParentContainer).append(deal.constructElement())
          });
        }
      });
  }
}

class DealCollections {
  constructor(numberOfDeals) {
    this.numberOfDeals = numberOfDeals;
    this.categoryId = 10;
    this.filter = 'Latest'; // Enum of 'Latest', 'Popular', 'PriceDrop'
    this.url = `https://staging.ratex.co/store/api/categories/${this.categoryId}?filter=${this.filter}&limit=${this.numberOfDeals}`;
    // Pagination
    this.page = 1;
    this.hasMore = null;
    // Dom elements
    this.dealsCollectionParentContainer = '.all-deals-wrapper';
    this.backButtonId = 'deals-custom-back';
    this.nextButtonId = 'deals-custom-next';
  }
  // Basically our driver function
  setupPage() {
    this.renderPagination(true, false); // Back always disabled on first page
    this.populateDeals();
    this.setUpPaginationButtonListeners();
  }
  // Populate deals from API.
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
            $(this.dealsCollectionParentContainer).append(deal.constructElement())
          });
          this.hasMore = response.hasMore;
          this.toggleNextButtonAvailability(response.hasMore);
        }
      });
  }
  // Helper function to clear our dom out
  clearOutAllExistingDeals() {
    $(this.dealsCollectionParentContainer)[0].innerHTML = "";
  }
  // Pagination Stuff
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
    $(PaginationElement).insertAfter($(this.dealsCollectionParentContainer));
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

// Individual deal cell
class DealCell {
  constructor(imageUrl, currentPrice, previousPrice, merchant, hot, name, itemUrl) {
    console.log('Constructing deal cell');
    this.imageUrl = imageUrl;
    this.currentPrice = currentPrice;
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
    const newElement = document.createElement("div");
    newElement.classList.add("deal-card-wraper", "full", "w-inline-block", "w-col-tiny-6");
    newElement.onclick = function () { window.open(this.itemUrl); };
    newElement.innerHTML = `
      <div
        class="div-block-249 _2"
        style="background-image: url(${this.imageUrl}); background-size: cover"
      >
        ${(this.percentageDiscount)
          ? `
          <div class="div-block-253">
            ${this.percentageDiscount.toFixed(0)}%
            <br />
            Off
          </div>
          `
          : ''
        }

      </div>
      <div class="deal-content-wrapper">
          <div class="div-block-252">
            <div
              class="text-block-189 _1"
              style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; height: 2.2em;"
              >
              ${this.name}
            </div>
            <div class="text-block-189 _2">${this.merchant}</div>
          </div>
          <div class="div-block-251"></div>
          <div class="w-clearfix">
            <div class="text-block-189 _3">$${this.currentPrice}</div>
            <div class="text-block-190">
              ${this.previousPrice ? `$${this.previousPrice}` : ''}
            </div>
            <div class="text-block-191">${this.hot ? 'HOT' : ''}</div>
          </div>
      </div>
    `;
    return newElement;
  }
}
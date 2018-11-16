/* Usage:
  const ratexDealsPage = new RatexDealsPage();
  // This inits Featured Deals, Deals Collection & Coupons
*/

// Main/Parent/Driver function
class RatexDealsPage {
  constructor() {
    // Init child classes
    this.featuredDeals = new FeaturedDeals(4);
    this.dealCollections = new DealCollections(20);
    const couponMerchant = new CouponMerchants(12);
    this.featuredDeals.populateDeals();
    this.dealCollections.setupPage();
    couponMerchant.setupPage();
  }
}


class FeaturedDeals {
  constructor(numberOfDeals) {
    this.numberOfDeals = numberOfDeals;
    this.url = `https://ratex.co/store/api/products?filter=Activities&limit=${this.numberOfDeals}`;
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
    // Mapping (Backend Categories)
    this.elementIdToCategoryIdMap = {
      'collection-popular': 64,
      'collection-best-amazon-deals': 57,
      'collection-Electronic-Appliances': 58,
      'collection-Tech-Gadgets': 59,
      'collection-Gaming': 60,
      'collection-Men-Fashion': 61,
      'collection-Women-Fashion': 62,
      'collection-Beauty-Health': 63,
    };
    this.categoryId = this.elementIdToCategoryIdMap['collection-popular'];
    this.filter = 'Latest'; // Enum of 'Latest', 'Popular', 'PriceDrop'
    this.url = `https://ratex.co/store/api/categories/c/${this.categoryId}?filter=${this.filter}&limit=${this.numberOfDeals}`;
    // Pagination for deal collections
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
    this.setUpCategoryButtonListeners();
    this.setUpPaginationButtonListeners();
  }
  // Category buttons and handlers
  // This function set up listeners for the button clicks
  // It'll pass the id of the element to handleCategoryChange function
  setUpCategoryButtonListeners() {
    $('.collection-nav').each((idx) => {
      const elementId = ($('.collection-nav')[idx].id);
      $(`#${elementId}`).click(() => {
        this.handleCategoryChange(elementId);
      });
    });
  }
  handleCategoryChange(elementId) {
    // Get the equivalent category id from element's id
    const categoryId = this.elementIdToCategoryIdMap[elementId];
    // We will
    // - Reset the page and hasMore
    // - Update current categoryId
    // - Update URL
    // - Populate deals
    this.page = 1;
    this.hasMore = null;
    this.categoryId = categoryId;
    this.url = `https://ratex.co/store/api/categories/c/${this.categoryId}?filter=${this.filter}&limit=${this.numberOfDeals}`;
    this.populateDeals();
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
      ? 'not-allowed' : 'pointer';
    BackButton.id = this.backButtonId;
    BackButton.innerText = '◂ Back';
    // Next
    const NextButton = document.createElement("div");
    NextButton.style.margin = '20px 36px';
    NextButton.classList.add("w-tab-link");
    NextButton.style.opacity = (nextDisabled) ? 0.6 : 1;
    NextButton.style.cursor = (nextDisabled)
      ? 'not-allowed' : 'pointer';
    NextButton.id = this.nextButtonId;
    NextButton.innerText = "Next ▸"

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
      // Check if disabled
      if (($(`#${this.backButtonId}`)[0].style.cursor) === "not-allowed") return;
      if (this.page > 1) {
        // Update page number
        this.page -= 1;
        // Update url
        this.url = `https://ratex.co/store/api/categories/c/${this.categoryId}?filter=${this.filter}&limit=${this.numberOfDeals}&offset=${this.numberOfDeals * (this.page - 1)}`;
        // re-populate deals
        this.toggleBackButtonAvailability(false);
        this.populateDeals();
        // Disable button if we are on page 1
        if (this.page === 1) {
          this.toggleBackButtonAvailability(false);
        }
      }
    })
    $(`#${this.nextButtonId}`).click(() => {
      // Check if disabled
      if (($(`#${this.backButtonId}`)[0].style.cursor) === "not-allowed") return;
      // Update page number
      this.page += 1;
      // Update url
      this.url = `https://ratex.co/store/api/categories/c/${this.categoryId}?filter=${this.filter}&limit=${this.numberOfDeals}&offset=${this.numberOfDeals * (this.page - 1)}`;
      // re-populate deals
      this.toggleNextButtonAvailability(false);
      this.populateDeals();
      // Can back, since we moved 1 forward
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
        style="background-image: none; background-size: cover"
      >
        <img
          src="${this.imageUrl}"
          style="height: 100%; width: 100%; object-fit: cover;"
        >
        ${(this.percentageDiscount)
          ? `
          <div class="div-block-253">
            ${(this.percentageDiscount).toFixed(0)}%
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
              style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; height: 2.6667em;"
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

class CouponMerchants {
  constructor(numberOfCoupons) {
    this.numberOfCoupons = numberOfCoupons;
    this.merchant = 'AMAZON'; // Default
    this.url = `https://ratex.co/store/api/coupons?merchant=${this.merchant}`;
    this.couponCodesParentContainer = $('.coupon-code-wrapper')[0];
  }
  setupPage() {
    this.setUpMerchantButtonListeners();
    this.populateCoupons();
  }
  setUpMerchantButtonListeners() {
    $('.link-block-48').each((idx) => {
      const elementId = ($('.link-block-48')[idx].id);
      if (!elementId) return;
      $(`#${elementId}`).click(() => {
        this.handleMerchantChange(elementId);
      });
    });
  }
  handleMerchantChange(elementId) {
    // Get the equivalent category id from element's id
    const merchant = elementId.split('-')[1] // HACK
    // We will
    // - Update current merchant
    // - Update URL
    // - Populate coupons
    this.merchant = merchant;
    this.url = `https://ratex.co/store/api/coupons?merchant=${this.merchant}`;
    this.populateCoupons();
  }
  clearOutAllExistingCoupons() {
    this.couponCodesParentContainer.innerHTML = "";
  }
  populateCoupons() {
    $.get(this.url)
      .then((response) => {
        if (response && response.data) {
          // Clear out old doms
          this.clearOutAllExistingCoupons();
          // Create deal cells
          const coupons = response.data;
          // HACK: There's no limit on coupons, so we just taper off the array here
          coupons.slice(0, this.numberOfCoupons).forEach(data => {
            const couponCell = new CouponCell(
              data.merchant,
              data.code,
              data.description,
            );
            $(this.couponCodesParentContainer).append(couponCell.constructElement())
          });
        }
      });
  }
}

class CouponCell {
  constructor(merchant, code, description) {
    this.merchant = merchant;
    this.code = code;
    this.description = description;
  }
  constructElement() {
    const newElement = document.createElement("div");
    newElement.classList.add("promo-code-link-wrapper", "w-inline-block");
    newElement.style.cursor = 'pointer';
    newElement.onclick = () => { 
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(this.code).select();
      document.execCommand("copy");
      $temp.remove();
      alert(`Coupon Code "${this.code}" copied to clipboard!`);
    };
    newElement.innerHTML = `
      <div class="promocode-content-wapper">
          <div class="text-block-198">${this.merchant}</div>
          <div class="div-block-252">
            <div class="text-block-189 _1">${this.code}</div>
            <div
              class="text-block-189 _2 code"
              style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; height: 5em;"
            >
              ${this.description}
            </div>
          </div>
      </div>
    `
    return newElement;
  }
}
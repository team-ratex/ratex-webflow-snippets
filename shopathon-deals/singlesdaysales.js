class Shopathon {
  constructor(numberOfDeals) {
    this.numberOfDeals = numberOfDeals;
    this.url = `https://ratex.co/store/api/products?filter=LATEST&limit=${numberOfDeals}`;
    this.page = 1;
    this.dealsParentContainer = '#deals-parent';
    this.tabContentContainer = '#tab-content-1';
    this.backButtonId = 'deals-custom-back';
    this.nextButtonId = 'deals-custom-next';
    this.hasMore = null;
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
        // Clear out old doms
        this.clearOutAllExistingDeals();
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
      // Clear out old doms
      this.clearOutAllExistingDeals();
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
class DealCell {
  constructor(imageUrl, price, merchant, name, itemUrl) {
    this.imageUrl = imageUrl;
    this.price = price;
    this.merchant = merchant;
    this.name = name;
    this.itemUrl = itemUrl;
  }
  getDomElement() {
    return this.constructElement();
  }
  constructElement() {
    const newElement = document.createElement("div");
    newElement.classList.add("w-col", "w-col-3", "w-col-small-6", "w-col-tiny-6");
    newElement.innerHTML = `
      <div class="cards-wraper" style="margin-bottom: 36px;">
        <a
          style="background-image: url(${ this.imageUrl})"
          href="${this.itemUrl}"
          class="link-block-38 w-inline-block"
          target="_blank"
        >
          <div class="products2-pricetag">
            <div class="text-16">$${this.price}</div>
          </div>
        </a>
        <div class="products2-description-wrap">
          <h3 class="heading-50">${this.merchant}</h3>
          <p
            class="text-14 text-14-60"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
          >${this.name}</p>
        </div>
      </div>
    `;
    return newElement;
  }
}
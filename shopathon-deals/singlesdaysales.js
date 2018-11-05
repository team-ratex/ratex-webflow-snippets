class Shopathon {
  constructor(numberOfDeals) {
    this.url = `https://ratex.co/store/api/products?filter=LATEST&limit=${numberOfDeals}`;
    this.page = 1;
    this.dealsParentContainer = '#deals-parent';
    this.tabContentContainer = '.w-tab-content';
  }
  // Basically our driver function
  setUpPage() {
    this.renderPagination();
    this.populateDeals();
  }
  renderPagination() {
    // Create Back and Next Buttons
    const BackButton = document.createElement("div");
    BackButton.classList.add("w-tab-link");
    BackButton.style.margin = '20px 36px';
    BackButton.innerText = "Back"
    const NextButton = document.createElement("div");
    NextButton.style.margin = '20px 36px';
    NextButton.classList.add("w-tab-link");

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
      }
    });
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
      <div class="cards-wraper">
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
          <p class="text-14 text-14-60">${this.name}</p>
        </div>
      </div>
    `;
    return newElement;
  }
}
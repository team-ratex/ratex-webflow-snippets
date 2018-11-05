class Shopathon {
  constructor(numberOfDeals) {
    this.url = `https://ratex.co/store/api/products?filter=LATEST&limit=${numberOfDeals}`;
  }
  populateDeals() {
    $.get(this.url)
    .then((response) => {
      if (response && response.data) {
        // Create deal cells
        const deals = response.data;
        deals.forEach(data => {
          console.log(
            data.images[0],
            data.listing.currentPrice,
            data.listing.merchant,
            data.name,
            data.listing.merchantURL,
          );
          const deal = new DealCell(
            data.images[0],
            data.listing.currentPrice,
            data.listing.merchant,
            data.name,
            data.listing.merchantURL,
          );
          $('#deals-parent').append(deal.element)
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
    this.element = this.constructElement();
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
            <div class="text-16">$${ this.price}</div>
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
const DealsSortable = (() => {
  // Constructor
  return {
    /****************** Price ******************/
    sortByPriceAscending: function () {
      var sortedElementsByAsc = $('.shop > .deals').sort(function (a, b) {
        const priceClassName = 'div.div-block-16 > div.div-block-7.w-clearfix > div.featured-deals.final-price';
        const priceA = $(a).find(priceClassName).html();
        const priceB = $(b).find(priceClassName).html();
        const priceAFloat = (priceA)
          ? parseFloat(priceA.substring(2))
          : 9999999999; // Phantom Element should always be at the back
        const priceBFloat = (priceB)
          ? parseFloat(priceB.substring(2))
          : 9999999999; // Phantom Element should always be at the back
        return priceAFloat - priceBFloat;
      });
      $('.shop').html(sortedElementsByAsc);
      DealsSortable.removeAndReaddPhantomElements();
    },
  
    sortByPriceDescending: function () {
      const sortedElementsByDsc = $('.shop > .deals').sort(function (a, b) {
        const priceClassName = 'div.div-block-16 > div.div-block-7.w-clearfix > div.featured-deals.final-price';
        const priceA = $(a).find(priceClassName).html();
        const priceB = $(b).find(priceClassName).html();
        const priceAFloat = (priceA)
          ? parseFloat(priceA.substring(2))
          : -9999999999; // Phantom Element should always be at the back
        const priceBFloat = (priceB)
          ? parseFloat(priceB.substring(2))
          : -9999999999; // Phantom Element should always be at the back
        return priceBFloat - priceAFloat;
      });
      $('.shop').html(sortedElementsByDsc);
      DealsSortable.removeAndReaddPhantomElements();
    },
  
    /****************** Savings ******************/
    sortBySavingsAscending: function () {
      var sortedElements = $('.shop > .deals').sort(function (a, b) {
        const savingsClassName = 'div.savings';
        // Grab the timestamp in webflow format
        const savingsA = $(a).find(savingsClassName).html();
        const savingsB = $(b).find(savingsClassName).html();
        const savingsAFloat = (savingsA)
          ? parseFloat(savingsA.substring(1))
          : 9999999999; // Phantom Element should always be at the back
        const savingsBFloat = (savingsB)
          ? parseFloat(savingsB.substring(1))
          : 9999999999; // Phantom Element should always be at the back
        return savingsAFloat - savingsBFloat;
      });
      $('.shop').html(sortedElements);
      DealsSortable.removeAndReaddPhantomElements();
    },
  
    sortBySavingsDescending: function () {
      const sortedElementsByDsc = $('.shop > .deals').sort(function (a, b) {
        const savingsClassName = 'div.savings';
        // Grab the timestamp in webflow format
        const savingsA = $(a).find(savingsClassName).html();
        const savingsB = $(b).find(savingsClassName).html();
        const savingsAFloat = (savingsA)
          ? parseFloat(savingsA.substring(1))
          : 9999999999; // Phantom Element should always be at the back
        const savingsBFloat = (savingsB)
          ? parseFloat(savingsB.substring(1))
          : 9999999999; // Phantom Element should always be at the back
        return savingsBFloat - savingsAFloat;
      });
      $('.shop').html(sortedElementsByDsc);
      DealsSortable.removeAndReaddPhantomElements();
    },
  
    /****************** Time Added ******************/
    sortByTimeAddedAscending: function () {
      var sortedElementsByAsc = $('.shop > .deals').sort(function (a, b) {
        const timestampClassName = 'div.date-of-post';
        // Grab the timestamp in webflow format
        const timestampA = $(a).find(timestampClassName).html();
        const timestampB = $(b).find(timestampClassName).html();
        // Handling phantom elements
        if (!timestampB) return false;
        if (!timestampA) return true;
  
        const timestampAInISO = parseWebflowDateToISO(timestampA);
        const unixEpochA = (new Date(timestampAInISO)).getTime();
        const timestampBInISO = parseWebflowDateToISO(timestampB);
        const unixEpochB = (new Date(timestampBInISO)).getTime();
        return unixEpochA - unixEpochB
      });
      $('.shop').html(sortedElementsByAsc);
      DealsSortable.removeAndReaddPhantomElements();
    },
  
    sortByTimeAddedDescending: function () {
      var sortedElements = $('.shop > .deals').sort(function (a, b) {
        const timestampClassName = 'div.date-of-post';
        // Grab the timestamp in webflow format
        const timestampA = $(a).find(timestampClassName).html();
        const timestampB = $(b).find(timestampClassName).html();
        // Handling phantom elements
        if (!timestampB) return false;
        if (!timestampA) return true;
  
        const timestampAInISO = parseWebflowDateToISO(timestampA);
        const unixEpochA = (new Date(timestampAInISO)).getTime();
        const timestampBInISO = parseWebflowDateToISO(timestampB);
        const unixEpochB = (new Date(timestampBInISO)).getTime();
        return unixEpochB - unixEpochA;
      });
      $('.shop').html(sortedElements);
      DealsSortable.removeAndReaddPhantomElements();
    },
  
    /* Hack-ish function to remove phantom elements and add them again */
    removeAndReaddPhantomElements: function () {
      const parentContainer = $('.w-dyn-list .w-dyn-items.shop')[0];
      // Remove
      $('.shop > .deals').each(function (idx, item) {
        if ($(item).hasClass('phantom-element')) {
          // Phantom element found
          $(item).remove();
        }
      });
  
      // Add
      const totalNumberOfDummyElements = 10;
      const element = '<div class="phantom-element card-item deals w-dyn-item" style="margin-top: 0; margin-bottom: 0; padding: 0!important; height: 0 !important; opacity: 0;" />';
      for (var i = 0; i < totalNumberOfDummyElements; i++) {
        $(parentContainer).append(element);
      }
    },
  }
})();
// Set up the listeners 
$(function () {
  var randomAssElement = "body > div.bg_hooray.blackfriday.bottomborder.primeday.quarter.v2_sectiontopmain > div > div > div > div.text-block-44.w-hidden-small.w-hidden-tiny";
  const arr = [
    'Price-Ascending',
    'Price-Descending',
    'Savings-Ascending',
    'Savings-Descending',
    'Latest',
    'Oldest',
  ];
  $(randomAssElement).append('<div style="height: 25px;" />');
  arr.map((text) => {
    $(randomAssElement).append(`<button style="padding: 5px 10px; margin: 8px;" id=${text}>${text}</button>`);
  })
  $('#Price-Ascending').on("click", DealsSortable.sortByPriceAscending);
  $('#Price-Descending').on("click", DealsSortable.sortByPriceDescending);
  $('#Savings-Ascending').on("click", DealsSortable.sortBySavingsAscending);
  $('#Savings-Descending').on("click", DealsSortable.sortBySavingsDescending);
  $('#Latest').on("click", DealsSortable.sortByTimeAddedDescending);
  $('#Oldest').on("click", DealsSortable.sortByTimeAddedAscending);
});
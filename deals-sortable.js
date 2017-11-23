// Function to add sorting functionality to the deals list
// We added onClick listeners to elements in the dropdown.
$(function () {
  const DealsSortable = (() => {
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
  $('#price-ascending').on("click", DealsSortable.sortByPriceAscending);
  $('#price-descending').on("click", DealsSortable.sortByPriceDescending);
  $('#savings-ascending').on("click", DealsSortable.sortBySavingsAscending);
  $('#savings-descending').on("click", DealsSortable.sortBySavingsDescending);
  $('#time-latest').on("click", DealsSortable.sortByTimeAddedDescending);
  $('#time-oldest').on("click", DealsSortable.sortByTimeAddedAscending);
});
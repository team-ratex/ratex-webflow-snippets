// Filters expiration for items
const filterExpiredProducts = (() => {
  const categoryStrEle = $
    ('<span/>')
      .css('color','#1f3541')
      .text('"' + $('.div-block-3 .div-block-4 .deals.merchant-title')[0].innerHTML + '"');
  const allExpiredEle = 
    $('<h2/>')
      .attr('id', 'all-expired')
      .css({
        'color': '#8f9aa0',
        'text-align': 'center',
        'width': '100%',
      })
      .text("No deals available for ")
      .append(categoryStrEle);

  $('.shop > .deals').each(function(idx, item) {
    const expiryClassName = 'div.expiration-time';
    const expiryTimestamp = $(item).find(expiryClassName).html();
    if (expiryTimestamp) {
      const currentProductExpiryInISO = parseWebflowDateToISO(expiryTimestamp);
      const currentProductExpiryDateObject = new Date(currentProductExpiryInISO);
      const currentDate = new Date();
      // If expired, we remove the cell
      if (currentDate > currentProductExpiryDateObject) $(item).remove();
    }
  });
  if ($('.shop > .deals').length === 0 ) {
    // Empty list
    $('.shop').append(allExpiredEle);
  }
})();
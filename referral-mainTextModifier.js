const promoParam = 'referral';
let referralCode = (new URL(window.location)).searchParams.get(promoParam)
if (referralCode && referralCode.length > 0) {
  referralCode = referralCode.replace(/<\/?[^>]+(>|$)/g, "")
  const mainText = $('.main-text').text();
  let additionalPromoText = '';
  let minSpending = '';
  switch (referralCode.toLowerCase()) {
    case ('dns5'):
      additionalPromoText = '<br/><br/>Sign up with promo code <b style="color:#309d67">' + referralCode + '</b> and get SGD5 off your next purchase!';
      minSpending = ' (min. spend SGD50)';
      $('.main-text').html(mainText + additionalPromoText + minSpending); 
      break;
    case ('tbpooling'):
      additionalPromoText = '<br/><br/>Sign up with promo code <b style="color:#309d67">' + referralCode + '</b> and get SGD8 off your next purchase!';
      $('.main-text').html(mainText + additionalPromoText);
      break;
    default:
      $.get('https://ratex.co/api/users/referral?referral_code=' + referralCode)
        .then(function(response) {
          if (response && response.status === "success") {
            const referrerName = response.data.name;
            // Construct referral text based on installer's name
            additionalPromoText = '<br/><br/>' + referrerName + ' wants you to save money when you shop online. Sign up with promo code <b style="color:#309d67">' + referralCode + '</b> and get SGD5 off your next purchase!';
            $('.main-text').html(mainText + additionalPromoText);
          }
        });
      break;
  }
}
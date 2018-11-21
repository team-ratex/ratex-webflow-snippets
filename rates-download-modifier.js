$(() => {
  // Install button modifier
  $('.install-app-button').each((idx) => {
    const element = $('.install-app-button')[idx];
    element.target = '_blank';
    //iPhone Version:
    if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
      element.href = 'https://itunes.apple.com/sg/app/rates-mobile-app-by-ratex/id1350096340?mt=8'
    }
    //Android Version:
    if (navigator.userAgent.match(/android/i)) {
      element.href = 'https://play.google.com/store/apps/details?id=com.rate.rates'
    }
  });
  // Open in rates modifier
  $('.open-app-button').each((idx) => {
    const element = $('.open-app-button')[idx];
    element.target = '_blank';
    element.href = 'ratesbyrate://';
  });
})

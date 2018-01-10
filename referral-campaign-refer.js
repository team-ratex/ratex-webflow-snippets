// On document ready
$(function () {
  // Helper function to parse url params
  // ref: https://cmatskas.com/get-url-parameters-using-javascript/
  var parseQueryString = function (url) {
    var urlParams = {};
    url.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function ($0, $1, $2, $3) {
        urlParams[$1] = $3;
      }
    );
    return urlParams;
  }
  // Helper function to create url string with base url and url parameters
  function createUrlString(baseUrl, urlParamsObject) {
    var urlParamsArray = [];
    for (var configName in urlParamsObject) {
      urlParamsArray.push(configName + '=' + encodeURI(urlParamsObject[configName]));
    }
    if (urlParamsArray.length > 0) {
      return baseUrl + '?' + urlParamsArray.join('&');
    }
    return baseUrl;
  }

  // Get page url params object
  var pageUrlParams = parseQueryString(window.location.search);


  // HTML DOM node references
  var uniqueLinkDiv = document.getElementById('Unique-Link');
  var copyLinkButton = document.getElementById('copy-link');
  var facebookShareButton = document.getElementById('facebook-share');
  var twitterShareButton = document.getElementById('twitter-share');
  var textNamePoints = document.getElementById('text-name-points');

  function getUniqueShareLink() {
    return uniqueLinkDiv.textContent;
  }

  // If page has url params for handle,
  if (pageUrlParams.h) {
    // Get Name and Points from backend
    $.ajax({
      method: 'GET',
      url: 'http://192.168.0.137:5000/api/referral_campaign/' + pageUrlParams.h // TODO: Change to actual URL values
    })
    .done(function (response) {
      // Set share link url
      uniqueLinkDiv.textContent = 'http://ratex.webflow.io/rates' + '?r=' + pageUrlParams.h;
      // Set name/points
      textNamePoints.textContent = textNamePoints.textContent.replace('{{name}}', response.data.name);
      textNamePoints.textContent = textNamePoints.textContent.replace('{{points}}', response.data.points);
      
      console.log('name:', response.data.name);
      console.log('points:', response.data.points);
    })
    .fail(function (jqxhr) {
      // TODO: replace with error
      console.log('retrieve handle info error:', jqxhr);
      // TODO: if 404, redirect to first page
      if (jqxhr.status === 404) { // HTTP 404 Not Found
        window.location.href = 'http://ratex.webflow.io/rates';
      } else {
        // Do nothing (may consider reloading page)
      }
    });
  }

  // Load Clipboard.js
  $.getScript('https://cdn.rawgit.com/zenorocha/clipboard.js/v1.7.1/dist/clipboard.min.js')
    .done(function () {
      // Use Clipboard.js to handle link copy
      // ref: https://clipboardjs.com/  -> under Advanced Usage
      var clipboard = new Clipboard(copyLinkButton, {
        text: function () {
          return getUniqueShareLink(); // content to push to clipboard
        }
      });
      clipboard.on('success', function (e) {
        e.clearSelection();
      });
      clipboard.on('error', function (e) {
        // Do nothing. maybe show user feedback on copy error :thinking:?
      });
    });

  // -- SHARING --
  // Load Facebook JavaScript SDK (used for share dialog)
  $.getScript('https://connect.facebook.net/en_US/sdk.js')
    .done(function () {
      // Init must be done after Facebook script loaded
      FB.init({
        // Config params ref: https://developers.facebook.com/docs/javascript/advanced-setup
        // appId: '1937545656511187', // prod
        appId: '115930669029566',
        xfbml: false,
        version: 'v2.11'
      });
      // FB.AppEvents.logPageView(); // log user page view

      // Setup share button
      facebookShareButton.onclick = function () {
        FB.ui({
          // Dialog config params ref: https://developers.facebook.com/docs/sharing/reference/share-dialog
          method: 'share',
          display: 'popup',
          // href: ''  // TODO: confirm URL to share
          href: window.location.href,
        })
        console.log('clicked');
      };
    });

  // Twitter web intent config
  // ref: https://dev.twitter.com/web/tweet-button/parameters
  var twitterShareConfig = {
    url: 'http://ratex.webflow.io/landing-page-1-copy',
    text: 'Custom share text',
    hashtags: 'RateX' // e.g. #RateX
    // via: '',  // e.g. @RateX
    // related: ''
  };

  // Create sharing url
  var twitterShareUrl = createUrlString('https://twitter.com/share', twitterShareConfig);
  // Setup share button
  twitterShareButton.onclick = function () {
    // window.open(twitterShareUrl, '_blank', 'resizable=yes,width=550,height=420');  // Twitter default but doesn't fully fit content
    window.open(twitterShareUrl, '_blank', 'resizable=yes,width=550,height=450'); // Fits content nicely
  };
});

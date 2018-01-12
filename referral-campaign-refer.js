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

  // Configurations
  // var SHARE_LINK_BASE_URL = 'https://ratex.webflow.io/rates'; // staging
  // var SERVER_API_BASE_URL = 'https://staging.ratex.co/api/';  // staging
  var SHARE_LINK_BASE_URL = 'https://www.ratex.co/rates'; // production
  var SERVER_API_BASE_URL = 'https://ratex.co/api/';  // production


  // Get page url params object
  var pageUrlParams = parseQueryString(window.location.search);

  // Flag to determine if handle exists in server
  var handleExists = false; // default to false before server check

  var shareLinkUrl = SHARE_LINK_BASE_URL;

  // HTML DOM node references
  var uniqueLinkNode = document.getElementById('Unique-Link');
  var copyLinkButton = document.getElementById('copy-link');
  var facebookShareButton = document.getElementById('facebook-share');
  var twitterShareButton = document.getElementById('twitter-share');
  var textNamePoints = document.getElementById('text-name-points');

  function getUniqueShareLink() {
    return uniqueLinkNode.value;
  }

  // If page has url params for handle,
  if (pageUrlParams.h) {
    // Get Name and Points from backend
    $.ajax({
      method: 'GET',
      url: SERVER_API_BASE_URL + 'referral_campaign/' + pageUrlParams.h
    })
    .done(function (response) { // Handle exists
      // Set share link url
      shareLinkUrl += '?r=' + pageUrlParams.h;  // Add referrer param to share link
      uniqueLinkNode.value = shareLinkUrl;
      // Set name/points
      textNamePoints.textContent = textNamePoints.textContent.replace('{{name}}', response.data.name);
      textNamePoints.textContent = textNamePoints.textContent.replace('{{points}}', response.data.points);
      
    })
    .fail(function (jqxhr) {
      console.log('retrieve handle info error:', jqxhr);
      // If 404, redirect to first page
      if (jqxhr.status === 404) { // HTTP 404 Not Found
        window.location.href = shareLinkUrl;
      } else {
        // Do nothing (may consider reloading page)
      }
    });
  } else {
    // Handle not supplied, redirect to sign up page (share link url)
    window.location.href = shareLinkUrl;
  }

  // Load Clipboard.js
  $.getScript('https://cdn.rawgit.com/zenorocha/clipboard.js/v1.7.1/dist/clipboard.min.js')
    .done(function () {
      // Disable default form submit action
      copyLinkButton.onclick = function (e) { e.preventDefault(); };
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
        appId: '1937545656511187', // prod
        // appId: '115930669029566', // dev
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
          href: shareLinkUrl, // url to go to when users click on shared post
        })
        console.log('clicked');
      };
    });

  // Twitter web intent config
  // Setup share button
  twitterShareButton.onclick = function () {
    window.open(createUrlString('https://twitter.com/share', {
      url: shareLinkUrl,
      text: 'Can’t wait for RateX’s new mobile launch - use my referral link and we’ll both get points to redeem cool prizes:',
      // hashtags: 'RateX',
      via: 'ratex_sg',
      // related: '',
    }),
      // '_blank', 'resizable=yes,width=550,height=420');  // Twitter default but doesn't fully fit content
    '_blank', 'resizable=yes,width=550,height=450'); // Fits content nicely
  };
});

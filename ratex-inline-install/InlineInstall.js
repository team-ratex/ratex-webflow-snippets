// // Firefox inline install
const firefoxInstall = (aEvent) => {
  for (var a = aEvent.target; a.href === undefined;) a = a.parentNode;
  var params = {
    "Foo": {
      URL: aEvent.target.href,
      Hash: aEvent.target.getAttribute("hash"),
      toString: function () { return this.URL; }
    }
  };
  InstallTrigger.install(params);
  return false;
};

/* 
 * This class' constructor takes in an array of IDs of the install buttons
 * Usage:
  * `new InlineInstallWrapper(['button-1', 'button-2', 'button-3']);`
  * E.g. `new InlineInstallWrapper(['installRateX']);`
  * This will trigger some dom changes, namely
    * Button will be changed to `Installed` if RateX is already installed
    * If the browser is non-chrome/firefox, we will mutate the button to 'join with facebook'
  * On the install button clicks, we will do a popup overlay to guide the user to install.
  * Notes:
    * Ensure that this class is loaded before instantiating, i.e.
    * <script type='text/javascript' async=false defer=false src='URL_TO_SCRIPT_HERE'></script>
    * <script>new InlineInstallWrapper(['button-1', 'button-2', 'button-3']);</script>
*/
class InlineInstallWrapper {
  constructor(arrayOfIds) {
    this.arrayOfInstallButtons = arrayOfIds.map((id) => {
      return document.getElementById(id);
    })
    // Variables
    this.isChrome = !!window.chrome && !!window.chrome.webstore;
    this.isFirefox = (navigator.userAgent.indexOf("Firefox") > 0);
    this.chromeStoreUrl = 'https://chrome.google.com/webstore/detail/lebeffkkoglndkjfggcokhkikpilochf';
    // Init runs
    this.runDocumentMutations();
  }

  // Function to add chrome install overlay
  addChromeExtensionInstallOverlay() {
      // Create the chrome install overlay
      const chromeOverlayElement = document.createElement('div');
      chromeOverlayElement.id = 'chrome-install-overlay';
      chromeOverlayElement.innerHTML = "<div class='horizontal-container animated fadeInUp'><img style='margin-right:15px; height:30px; width:auto;' src='https://blog.ratex.co/assets/images/ratex-install-arrow.png' alt='ratex-arrow'><h3>Click <b>Add Extension</b> above to continue</h3></div>"
      + "<img id='ratex-rocket-img' class='animated fadeInUp' src='https://blog.ratex.co/assets/images/ratex-download-rocket.png' alt='ratex-rocket'/>"
      + "<h4 class='animated fadeInUp'>Almost there!</h4>";

      this.chromeOverlayElement = chromeOverlayElement;
      // Append it in
      document.body.appendChild(chromeOverlayElement);
  }
  
  //Basically to remove that overlay above
  removeChromeExtensionInstallOverlay() {
      // Delete element
      this.chromeOverlayElement.className= "animated fadeOutDown"
      setTimeout(() => {
        if (this.chromeOverlayElement) {
          this.chromeOverlayElement.outerHTML = "";
          delete this.chromeOverlayElement;
        }
      }, 1000);
  }

  // Chrome extension inline install function
  getChromeExtensionInline() {
    this.addChromeExtensionInstallOverlay();
    try {
      chrome.webstore.install(
        this.chromeStoreUrl,
        () => {
          if (window.location.search === '?ctci') {
            // Optional: If it's installed through homepage on modal deals, we open merchant page too
            if ($('.product-content-wraper:visible').length > 0) {
              const url = ($('.cta-wrapper .link-11')[0].href);          
              window.location = url;
            }
          }
          this.removeChromeExtensionInstallOverlay()
        },
        () => {this.removeChromeExtensionInstallOverlay()}
      );
    } catch {
      // Inline installation failed - We open the appstore's likn in a new tab instead
      window.open(this.chromeStoreUrl);
    }
  }

  // Function to check if extension is installed
  checkAndSetIfExtensionInstalled() {
    if (document.getElementById('ratex-extension-is-installed')) {
      var i;
      this.arrayOfInstallButtons.forEach((button) => {
        button.innerHTML = 'Installed';
        button.onclick = null;
      })
      return true;
    } else {
      return false;
    }
  }

  // We will run this function on init
  // If the extension is not installed, we bind install listeners to it.
  // If it is installed, the `checkAndSetIfExtensionInstalled` function will mutate the button to reflect it
  runDocumentMutations() {
    if (this.isChrome) {
      if (!this.checkAndSetIfExtensionInstalled()) {
        this.arrayOfInstallButtons.forEach((button) => {
          if (button) button.onclick = this.getChromeExtensionInline.bind(this);
        })
      }
    } else if (this.isFirefox) {
      if (!this.checkAndSetIfExtensionInstalled()) {
        this.arrayOfInstallButtons.forEach((button) => {
          if (button) {
            button.style.backgroundSize = 'contain';
            if ($(window).width() >= 977) button.style.backgroundImage = 'url("https://daks2k3a4ib2z.cloudfront.net/56db4d20631460036ac79a2b/5982b63bbadc3c00011defb3_Untitled-2.png")';
            button.setAttribute('iconURL', 'https://addons.cdn.mozilla.net/user-media/addon_icons/821/821634-64.png?modified=1501590021&1501817260201');
            button.setAttribute('href', 'https://addons.mozilla.org/firefox/downloads/latest/ratex/addon-821634-latest.xpi');
            button.onclick = "return firefoxInstall(event);"
            button.setAttribute('data-hash', "sha256:883161bcdf6f1dd765134b59252bd2276091c380cc7609fb97e40f3452cc99d1");
            button.setAttribute('target', "");
          }
        }); 
      }
    } else {
      // Non-supported browser
      var fbIcon = document.createElement('img');
      fbIcon.src = 'https://daks2k3a4ib2z.cloudfront.net/56db4d20631460036ac79a2b/58660855dea92ad03ac59877_facebook-white-transparent.png';
      fbIcon.alt = 'fb_icon';
      // Set styles for these buttons
      this.arrayOfInstallButtons.forEach((button) => {
        if (button) {
          button.style.backgroundSize = 'initial';
          button.style.backgroundPosition = '10% 50%';
          button.style.backgroundImage = 'none';
          if ($(window).width() >= 977) button.style.backgroundImage = 'url(' + fbIcon.src + ')';
          button.innerHTML = 'Join with Facebook';
          button.classList.add('button_tryextension_notsupported');
          button.href = "https://www.facebook.com/RateX-194127197634012/";
        }
      }); 
    }
    // Remove cloak
    this.arrayOfInstallButtons.forEach((button) => {
      if (button) button.removeAttribute('v-cloak');
    }); 
    // Observers
    const domObv = new MutationObserver(function (mutations) {
      if (document.getElementById('ratex-extension-is-installed')) {
        domObv.disconnect();
      }
    });
    const domObvConfig = { childList: true };
    domObv.observe(document.getElementsByTagName("BODY")[0], domObvConfig);
    
    // Window resize function to conditionally hide background image of button
    $(window).resize(function () {
      if ($( window ).width() < 977) {
        // Conditional Breakpoint - hide image
        this.arrayOfInstallButtons.forEach((button) => {
          if (button) button.style.backgroundImage = 'none';
        }); 
      } else {
        this.arrayOfInstallButtons.forEach((button) => {
          if (this.isChrome) {
            if (button) button.style.backgroundImage = 'url("https://daks2k3a4ib2z.cloudfront.net/56db4d20631460036ac79a2b/5988129f6dccc600016b8f5f_button-4.png")';
          } else if (this.isFirefox) {
            if (button) button.style.backgroundImage = 'url("https://daks2k3a4ib2z.cloudfront.net/56db4d20631460036ac79a2b/5982b63bbadc3c00011defb3_Untitled-2.png")';
          } else {
            if (button) button.style.backgroundImage = 'url("https://daks2k3a4ib2z.cloudfront.net/56db4d20631460036ac79a2b/58660855dea92ad03ac59877_facebook-white-transparent.png")';
          }
        }); 
      }
    });
  }
};

<!-- Code for inline installation logic -->
<style>
#chrome-install-overlay{z-index:15000;width:100%;height:100vh;min-height:630px;background:#fff;position:fixed;top:0;left:0;color:#1f3542 !important;display:flex;display:-webkit-box;display:-webkit-flex;display:-moz-flex;display:-ms-flexbox;-webkit-flex-direction:column;-moz-flex-direction:column;-ms-flex-direction:column;flex-direction:column;justify-content:space-around;-webkit-justify-content:space-around;-moz-justify-content:space-around;-webkit-align-items:center;-moz-align-items:center;align-items:center}#chrome-install-overlay .horizontal-container{display:flex;display:-webkit-box;display:-webkit-flex;display:-moz-flex;display:-ms-flexbox;-webkit-flex-direction:row;-moz-flex-direction:row;-ms-flex-direction:row;flex-direction:row;padding-top:275px;padding-left:10px;padding-right:10px;height:50px;-webkit-align-items:center;-moz-align-items:center;align-items:center}#chrome-install-overlay .horizontal-container h3{margin:0px !important}#chrome-install-overlay #ratex-rocket-img{height:40vh;min-height:200px;width:auto}
</style>
<script>
const addChromeExtensionInstallOverlay = () => {
      // Create the chrome install overlay
      const chromeOverlayElement = document.createElement('div');
      chromeOverlayElement.id = 'chrome-install-overlay';
      chromeOverlayElement.innerHTML = "<div class='horizontal-container animated fadeInUp'><img style='margin-right:15px; height:30px; width:auto;' src='https://blog.ratex.co/assets/images/ratex-install-arrow.png' alt='ratex-arrow'><h3>Click <b>Add Extension</b> above to continue</h3></div>"
      + "<img id='ratex-rocket-img' class='animated fadeInUp' src='https://uploads-ssl.webflow.com/5a7d218d6001ff0001f3d5cc/5ad24a903265e972084448c5_rate3-download-rocket.png' alt='ratex-rocket'/>"
      + "<h4 class='animated fadeInUp'>Almost there!</h4>";

      // Append it in
      document.body.appendChild(chromeOverlayElement);
  }
  //Basically to remove that overlay
  const removeChromeExtensionInstallOverlay = () => {
      // Delete element
      const element = document.getElementById("chrome-install-overlay");
      element.className= "animated fadeOutDown"
      setTimeout(() => {
          element.outerHTML = "";
          delete element;
      }, 1000);
  }
  
  var getChromeExtensionInline = function() {
    addChromeExtensionInstallOverlay();
    chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/engakonjhgilknldfhheedanoobggjhf',
      () => {
		if (window.location.search === '?ctci') {
          // Optional: If it's installed through homepage on modal deals, we open merchant page too
          if ($('.product-content-wraper:visible').length > 0) {
            const url = ($('.cta-wrapper .link-11')[0].href);          
            window.location = url;
          }
        }
        removeChromeExtensionInstallOverlay()
      },
      () => {removeChromeExtensionInstallOverlay()}
    );
  }
  var checkAndSetIfExtensionInstalled = function() {
    if (document.getElementById('ratex-extension-is-installed')) {
      var i;
      for (i = 0; i < arguments.length; i++) {
        if (arguments[i]){
          	arguments[i].innerHTML = 'Installed';
	        arguments[i].onclick = null;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  
  var isChrome = !!window.chrome && !!window.chrome.webstore;
  var installBtnOne = document.getElementById('ratex-install-button-1');
  var notAvailBtn = document.getElementById('ratex-not-available');
  if (isChrome) {
    if (!checkAndSetIfExtensionInstalled(installBtnOne)) {
      if (installBtnOne) installBtnOne.onclick = getChromeExtensionInline;
    }
  } else {
  	installBtnOne.style.display = 'none';
    notAvailBtn.style.display = 'block';
    notAvailBtn.classList.remove('w-hidden-main');
  }
  </script>
  <!-- END Code for inline installation logic -->

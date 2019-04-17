/*
 * This function may take in parameter of initialTime , followUpTime and duration
 * Usage:
  * popupInit()
  * Wait for 10 seconds, display appear for 7 seconds (inclusive of 1 second entrance and 1 second exit).
  * Display disappeared afterwards until the next batch of data is loaded. 
  * Calculation for waitTime to appear again = followUpTime - duration = 10 - 7 = 3 seconds
  * 
  * popupInit(5000, 13000, 7000)
  * Wait for 5 seconds, display appear for 9 seconds (inclusive of 1 second entrance and 1 second exit).
  * Display disappeared afterwards until the next batch of data is loaded.
  * Calculation for waitTime to appear again = followUpTime - duration = 13 - 9 = 4 seconds
  * 
  * User is able to click the display with the following: ,
    * close (x) to close the display.
    * others open a new tab directs them to ratex.co products or coupons depending on the display shown.
  * Notes:
    * Ensure that this function and style are loaded before instantiating, i.e.
    * <link rel="stylesheet" href="URL_TO_STYLE_HERE">
    * <script type='text/javascript' async=false defer=false src='URL_TO_SCRIPT_HERE'></script>
    * <script>popupInit();</script>
*/
// closure used lexical scoping such that other functions are not be able to called
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
function popupInit(initialTime = 10000, followUpTime = 10000, duration = 5000) {
  let popupData = {};
  let repeatIdCheck = [];
  let initialTimeup;
  let followUpTimeup;
  let durationTimeUp;
  let appearDuration;

  // enum 
  const localStorageKey = 'popupIdList';
  const popup = {
    popupContainerClass: 'popupContainer',
    imageId: 'imageContent',
    titleId: 'title',
    nameId: 'name',
    timeId: 'time',
    closeId: 'close'
  }

  // Set up the app fomo popup
  function setup(){
    const hasPopupIdList = localStorage.getItem(localStorageKey) !== null &&
      Array.isArray(JSON.parse(localStorage.getItem(localStorageKey)));
    if (hasPopupIdList) {
      repeatIdCheck = JSON.parse(localStorage.getItem(localStorageKey));
    }
    const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
    const retreivalTimelimit = 10000;
    const durationLimit = 5000;
    // Prevent calling popupSetup function twice
    if (!popupContainer) {
      if (typeof initialTime !== 'number' || initialTime < 0) {
        initialTime = retreivalTimelimit;
      }
      if (typeof followUpTime !== 'number' || followUpTime < retreivalTimelimit) {
        followUpTime = retreivalTimelimit
      }
      if (typeof duration !== 'number' || duration < 0 || duration >= followUpTime) {
        //1s faded in , 1s faded out
        duration = followUpTime - 2000;
      }
      if (duration < durationLimit) {
        duration = durationLimit;
      }
      appearDuration = duration;
      createDisplay();
      // when time reaches the initalTime , intervally calls the incoming data, retrieve data and display. 
      initialTimeup = setTimeout(function () {
        incomingIntervalUpdate(followUpTime);
        retrieveData();
      }, initialTime);
    }
  }
  // Create the display of app fomo
  function createDisplay() {
    const popupElement = document.createElement('div');
    popupElement.className = popup.popupContainerClass;
    popupElement.id = 'popupContainerOut';
    popupElement.innerHTML =
      "<img id=" + popup.imageId + " />" +
      "<div class=textContainer>" +
      "<div class=closeContainer>" +
      "<div id=" + popup.titleId + "></div>" +
      "<div id=" + popup.closeId + ">X</div>" +
      "</div>" +
      "<div id=" + popup.nameId + "></div>" +
      "<div id=" + popup.timeId + "></div>";
    document.body.appendChild(popupElement);
    popupElement.onclick = function (e) {
      if (e.target.id === popup.closeId) {
        closePopup();
      } else {
        openInNewTab();
      }
    }
  }
  // Retrieve the data from ratex.co/store/api/feed
  function retrieveData() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://ratex.co/store/api/feed', true);
    xhr.addEventListener("load", function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.response);
        popupData.date = calTimeDiff(data.data[0].last_success);
        if (data.data[0].type === "PRODUCT") {
          popupData.title = "Someone recently purchased";
          popupData.name = data.data[0].product.name;
          popupData.image = data.data[0].product.images[0];
          popupData.id = "P" + data.data[0].product.id.toString();
          popupData.link = "https://ratex.co/home/" + data.data[0].product.slug + "/p/" + data.data[0].product.id;
        } else {
          popupData.title = "Someone recently used";
          popupData.name = data.data[0].coupon.merchant;
          popupData.image = "https://s3-ap-southeast-1.amazonaws.com/ratex-merchants/icons/ecommerce/" + data.data[0].coupon.merchant + ".png"
          popupData.id = "C" + data.data[0].coupon.id.toString();
          popupData.link = "https://ratex.co/home/shops/#voucher=" + data.data[0].coupon.id;
        }
        updateDisplay();
      }
    }, false);
    xhr.send();
  }

  // Calcute the difference between today's time and data's time 
  function calTimeDiff(time) {
    const todayDate = new Date();
    const compareDate = new Date(time);
    const timeDiff = Math.abs(todayDate.getTime() - compareDate.getTime());
    const minutes = 60 * 1000;
    const hours = minutes * 60;
    const day = hours * 24;
    let diffDays;
    if (timeDiff > minutes) {
      diffDays = Math.ceil(timeDiff / minutes).toString() + " minutes ago";
    }
    if (timeDiff > hours) {
      diffDays = Math.ceil(timeDiff / hours).toString() + " hours ago";
    }
    if (timeDiff > day) {
      diffDays = Math.ceil(timeDiff / day).toString() + " days ago";
    }
    return diffDays;
  }

  // Update the display
  function updateDisplay() {
    if (repeatIdCheck.indexOf(popupData.id) === -1) {
      const imageContent = document.getElementById(popup.imageId);
      if (imageContent) {
        imageContent.setAttribute('alt', popupData.name);
        imageContent.setAttribute('src', popupData.image);
      }
      const title = document.getElementById(popup.titleId);
      if (title) {
        title.innerText = popupData.title;
      }
      const name = document.getElementById(popup.nameId);
      if (name) {
        name.innerText = popupData.name;
      }
      const time = document.getElementById(popup.timeId);
      if (time) {
        time.innerText = popupData.date;
      }
      const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
      if (popupContainer) {
        popupContainer.id = "popupContainerEntrance";
      }
      // update the check
      repeatIdCheck.push(popupData.id);
      localStorage.setItem(localStorageKey, JSON.stringify(repeatIdCheck));
      appearDurationBeforeExit();
    }
  }

  // Duration that the app fomo appears before it disappear
  function appearDurationBeforeExit() {
    durationTimeUp = setTimeout(function () {
      const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
      if (popupContainer) {
        popupContainer.id = "popupContainerExit";
      }
    }, appearDuration);
  }

  // Handles at an interval of followUp time to get the data 
  function incomingIntervalUpdate(followUpTime) {
    followUpTimeup = setInterval(function () {
      retrieveData();
    }, followUpTime);
  }

  // Open a new tab base on the link
  function openInNewTab() {
    if (!!popupData.link) {
      const win = window.open(popupData.link, '_blank');
      win.focus();
    }
  }

  // Close the app fomo popup
  function closePopup() {
    const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
    if (popupContainer) {
      // To make it "disappear"
      popupContainer.id = "popupContainerExit";
    }
    // Stop the time
    clearTimeout(initialTimeup);
    clearInterval(followUpTimeup);
    clearTimeout(durationTimeUp);
  }

  setup();
}

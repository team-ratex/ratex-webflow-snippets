var popupData = {};
var repeatIdCheck = [];
var initalTimeup;
var followUpTimeup;
var durationTimeUp;
var appearDuration;

function popupSetup(initalTime = 10000, followUpTime = 10000, duration = 5000) {
  // retrieve data
  if (sessionStorage.getItem('popupIdList') !== null) {
    repeatIdCheck = JSON.parse(sessionStorage.getItem('popupIdList'));
  }
  var popupContainer = document.getElementsByClassName('popupContainer')[0];
  var retreivalTimelimit = 10000;
  var durationLimit = 5000;
  if (!popupContainer) {
    if (followUpTime < retreivalTimelimit) {
      followUpTime = retreivalTimelimit
    }
    if (duration >= followUpTime) {
      //1s faded in , 1s faded out
      duration = followUpTime - 2000;
    }
    if (duration < durationLimit) {
      duration = durationLimit;
    }
    appearDuration = duration;
    createDisplay();
    initalTimeup = setTimeout(function () {
      retrieveData();
      incomingUpdate(followUpTime);
    }, initalTime);
  }
}

// 
function createDisplay() {
  var popupElement = document.createElement('div');
  popupElement.className = 'popupContainer';
  popupElement.id = 'popupContainerOut';
  popupElement.innerHTML =
    "<img id=imageContent></img>" +
    "<div class=textContainer>" +
    "<div class=closeContainer>" +
    "<div id=title></div>" +
    "<img src='https://raw.githubusercontent.com/rate-engineering/ratex-webflow-snippets/44ee8793cc84d126b9ecf0f36bdc9f4dd1c2bfbf/ClosePopup.svg' alt='close' id='close' />" +
    "</div>" +
    "<div id=name></div>" +
    "<div id=time></div>" +
    "</div>"
  document.body.appendChild(popupElement);
  popupElement.onclick = function (e) {
    if (e.target.id === 'close') {
      closePopup();
    } else {
      openInNewTab();
    }
  }
}

function retrieveData() {
    var xhr = new XMLHttpRequest(), data, latestData = {};
    xhr.open('GET', 'https://ratex.co/store/api/feed', true);
    xhr.addEventListener("load", function () {
      if (xhr.status === 200) {
        data = JSON.parse(xhr.response);
        latestData.date = calTimeDiff(data.data[0].last_success);
        if (data.data[0].type === "PRODUCT") {
          latestData.title = "Someone recently purchased";
          latestData.name = data.data[0].product.name;
          latestData.image = data.data[0].product.images[0];
          latestData.id = "P"+ data.data[0].product.id.toString();
          latestData.link = "https://ratex.co/home/" + data.data[0].product.slug + "/p/" + data.data[0].id;
        } else {
          latestData.title = "Someone recently used";
          latestData.name = data.data[0].coupon.merchant;
          latestData.image = "https://s3-ap-southeast-1.amazonaws.com/ratex-merchants/icons/ecommerce/" + data.data[0].coupon.merchant + ".png"
          latestData.id = "C" + data.data[0].coupon.id.toString();
          latestData.link = "https://ratex.co/home/shops/#voucher=" + data.data[0].id;
        }
        updateDisplay(latestData);
      } else { 
        // console.log('error');
      }
    }, false );
    xhr.send();
}

function calTimeDiff(time) {
  var todayDate = new Date();
  var compareDate = new Date(time);
  var timeDiff = Math.abs(todayDate.getTime() - compareDate.getTime());
  var minutes = 60 * 1000;
  var hours = minutes * 60;
  var day = hours * 24;
  var diffDays;
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

function updateDisplay(popupData) {
  if (repeatIdCheck.indexOf(popupData.id) === -1) {
    var imageContent = document.getElementById('imageContent');
    if (imageContent) {
      imageContent.setAttribute('alt', popupData.name);
      imageContent.setAttribute('src', popupData.image);
    }
    var title = document.getElementById('title');
    if (title) {
      title.innerText = popupData.title;
    }
    var name = document.getElementById('name');
    if (name) {
      name.innerText = popupData.name;
    }
    var time = document.getElementById('time');
    if (time) {
      time.innerText = popupData.date;
    }
    var popupContainer = document.getElementsByClassName("popupContainer")[0];
    if (popupContainer) {
      popupContainer.id = "popupContainerEntrance";
    }
    // update the check
    repeatIdCheck.push(popupData.id);
    sessionStorage.setItem('popupIdList', JSON.stringify(repeatIdCheck));
    appearDurationBeforeExit();
  }
}

function appearDurationBeforeExit() {
  durationTimeUp = setTimeout(function () {
    var popupContainer = document.getElementsByClassName("popupContainer")[0];
    if (popupContainer) {
      popupContainer.id = "popupContainerExit";
    }
  }, appearDuration);
}

function incomingUpdate(followUpTime) {
  followUpTimeup = setTimeout(function () {
    retrieveData();
    incomingUpdate(followUpTime);
  }, followUpTime);
}

function openInNewTab() {
  var win = window.open(popupData.link, '_blank');
  win.focus();
}

function closePopup() {
  var popupContainer = document.getElementsByClassName('popupContainer')[0];
  if (popupContainer) {
    popupContainer.id = "popupContainerExit";
  }
  clearTimeout(initalTimeup);
  clearTimeout(followUpTimeup);
  clearTimeout(durationTimeUp);
}
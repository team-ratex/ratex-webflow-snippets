// Structure of code
// -- Helper functions
// -- Configurations
// -- Error messages
// -- DOM node references
// -- DOM manipulation functions
// -- Logic functions and code
// -- DOM interaction listeners (e.g. onclick, oninput, etc)

$(function () {
  // Global ajax setup
  $.ajaxSetup({
    crossDomain: true,
    xhrFields: {
      withCredentials: true,
    },
  });

  // -- Helper functions
  // Function to parse url params
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
  // --
  // Get page url params object
  var pageUrlParams = parseQueryString(window.location.search);


  // -- Configurations
  var SERVER_API_BASE_URL = 'https://staging.ratex.co/api/';
  var OTP_COOLDOWN_DURATION = 30; // cooldown duration in seconds (must be > 0)


  // -- Error messages
  // var ERROR_GENERAL_FAILURE = 'Oops! Something went wrong while submitting the form.';
  var ERROR_GENERAL_FAILURE = 'Oops! Something went wrong. Please try again!';
  var ERROR_INVALID_EMAIL = 'Please enter a valid email address.';
  var ERROR_INVALID_NAME = 'Please enter a valid name.';
  var ERROR_INVALID_PHONE_NUMBER = 'Please enter a valid phone number.';
  var ERROR_INVALID_OTP = 'Please enter a 6-digit OTP';
  // --


  // -- DOM node references
  // Email form node references
  var emailFormNode = document.getElementById('wf-form-enter-email');
  var emailFormInputNode = document.getElementById('input-email');
  var emailFormSubmitButtonNode = document.getElementById('submit-email');
  var emailFormBlockNode = emailFormNode.parentNode;
  var emailFormFeedbackDoneNode = emailFormBlockNode.querySelector('.w-form-done');
  var emailFormFeedbackFailNode = emailFormBlockNode.querySelector('.w-form-fail');
  var emailFormFeedbackFailMessageNode = emailFormFeedbackFailNode.querySelector('div');
  // Enroll form node references
  var enrollFormNode = document.getElementById('wf-form-enter-phone-number');  // TODO
  var enrollFormInputNameNode = document.getElementById('input-name');
  var enrollFormInputPhoneNumberNode = document.getElementById('input-phone-number');
  var enrollFormSubmitButtonNode = document.getElementById('submit-phone-number');
  var enrollFormBlockNode = enrollFormNode.parentNode;
  var enrollFormFeedbackDoneNode = enrollFormBlockNode.querySelector('.w-form-done');
  var enrollFormFeedbackFailNode = enrollFormBlockNode.querySelector('.w-form-fail');
  var enrollFormFeedbackFailMessageNode = enrollFormFeedbackFailNode.querySelector('div');
  // OTP form node references
  var otpFormTextNode = document.getElementById('text-otp');
  var otpFormNode = document.getElementById('wf-form-enter-otp');
  var otpFormInputNode = document.getElementById('input-otp');
  var otpFormSubmitNode = document.getElementById('submit-otp');
  var otpLinkResendNode = document.getElementById('link-resend-otp');
  var otpLinkBackToEnrollNode = document.getElementById('link-reenter-phone');
  var otpFormBlockNode = otpFormNode.parentNode;
  var otpFormFeedbackFailNode = otpFormBlockNode.querySelector('.w-form-fail');
  var otpFormFeedbackFailMessageNode = otpFormFeedbackFailNode.querySelector('div');
  // --

  // Save original submit button texts
  var ORIGINAL_EMAIL_SUBMIT_BUTTON_TEXT = emailFormSubmitButtonNode.value;
  var ORIGINAL_PHONE_NUMBER_SUBMIT_BUTTON_TEXT = enrollFormSubmitButtonNode.value;
  var ORIGINAL_OTP_SUBMIT_BUTTON_TEXT = otpFormSubmitNode.value;


  // -- DOM manipulation functions
  // Email form
  function disableEmailFormElements() {
    emailFormInputNode.setAttribute('disabled', true);
    emailFormSubmitButtonNode.setAttribute('disabled', true);
  }
  function enableEmailFormElements() {
    emailFormInputNode.removeAttribute('disabled');
    emailFormSubmitButtonNode.removeAttribute('disabled');
    emailFormSubmitButtonNode.value = ORIGINAL_EMAIL_SUBMIT_BUTTON_TEXT;
  }
  function showEmailFormError(errorMessage) {
    emailFormFeedbackFailMessageNode.textContent = errorMessage;
    emailFormFeedbackFailNode.style.display = 'block';
    enableEmailFormElements();
  }
  function showEmailFormProcessing() {
    emailFormFeedbackFailNode.style.display = 'none';
    emailFormSubmitButtonNode.value = emailFormSubmitButtonNode.dataset.wait;
    disableEmailFormElements();
  }
  function showEmailFormDone() {
    emailFormFeedbackDoneNode.style.display = 'block';
    emailFormNode.style.display = 'none';
  }
  // Enroll form
  function enableEnrollFormInputs() {
    enrollFormInputNameNode.removeAttribute('disabled');
    enrollFormInputPhoneNumberNode.removeAttribute('disabled');
  }
  function setEnrollFormSubmitInactive() {
    enrollFormSubmitButtonNode.setAttribute('disabled', true);
    enrollFormSubmitButtonNode.style.backgroundImage = 'linear-gradient(90deg, grey, grey, grey)';
  }
  function setEnrollFormSubmitActive() {
    enrollFormSubmitButtonNode.removeAttribute('disabled');
    enrollFormSubmitButtonNode.style.backgroundImage = null;
  }
  function setEnrollFormSubmitTimer(seconds) {
    if (seconds > 0) {
      enrollFormSubmitButtonNode.value = ORIGINAL_PHONE_NUMBER_SUBMIT_BUTTON_TEXT.trim() + ' (' + String(seconds) + ')';
      // enrollFormSubmitButtonNode.value = ORIGINAL_PHONE_NUMBER_SUBMIT_BUTTON_TEXT.trim() + seconds;
    } else {
      enrollFormSubmitButtonNode.value = ORIGINAL_PHONE_NUMBER_SUBMIT_BUTTON_TEXT;
    }
  }
  function disableEnrollFormElements() {
    enrollFormInputNameNode.setAttribute('disabled', true);
    enrollFormInputPhoneNumberNode.setAttribute('disabled', true);
    enrollFormSubmitButtonNode.setAttribute('disabled', true);
  }
  function enableEnrollFormElements() {
    enrollFormInputNameNode.removeAttribute('disabled');
    enrollFormInputPhoneNumberNode.removeAttribute('disabled');
    enrollFormSubmitButtonNode.removeAttribute('disabled');
    enrollFormSubmitButtonNode.value = ORIGINAL_PHONE_NUMBER_SUBMIT_BUTTON_TEXT;
  }
  function showEnrollFormError(errorMessage) {
    enrollFormFeedbackFailMessageNode.textContent = errorMessage;
    enrollFormFeedbackFailNode.style.display = 'block';
    enableEnrollFormElements();
  }
  function showEnrollForm() {
    // enrollFormNode.style.display = 'block';
    enrollFormBlockNode.style.display = 'block';
  }
  function showEnrollFormProcessing() {
    enrollFormFeedbackFailNode.style.display = 'none';
    enrollFormSubmitButtonNode.value = enrollFormSubmitButtonNode.dataset.wait;
    disableEnrollFormElements();
  }
  function hideEnrollForm() {
    // enrollFormNode.style.display = 'none';
    enrollFormBlockNode.style.display = null;
  }
  // Otp form
  function disableOtpFormElements() {
    otpFormInputNode.setAttribute('disabled', true);
    otpFormSubmitNode.setAttribute('disabled', true);
  }
  function enableOtpFormElements() {
    otpFormInputNode.removeAttribute('disabled');
    otpFormInputNode.removeAttribute('disabled');
    otpFormSubmitNode.value = ORIGINAL_OTP_SUBMIT_BUTTON_TEXT;
  }
  function showOtpForm() {
    // otpFormNode.style.display = 'block';
    otpFormBlockNode.style.display = 'block';
  }
  function showOtpFormProcessing() {
    otpFormInputNode.setAttribute('disable', true);
    otpFormSubmitNode.setAttribute('disable', true);
    otpFormSubmitNode.value = otpFormSubmitNode.dataset.wait;
  }
  function showOtpFormError(errorMessage) {
    otpFormFeedbackFailMessageNode.textContent = errorMessage;
    otpFormFeedbackFailNode.style.display = 'block';
    enableOtpFormElements();
  }
  function hideOtpForm() {
    // otpFormNode.style.display = 'none';
    otpFormBlockNode.style.display = null;
  }
  var ORIGINAL_PHONE_NUMBER_TEXT = otpFormTextNode.textContent;
  // Break original phone number text into array (before, at, after {{PHONE_NUMBER}})
  var otpTextArray = ORIGINAL_PHONE_NUMBER_TEXT.split('{{PHONE_NUMBER}}');
  function setOtpFormTextPhoneNumber(phoneNumber) {
    otpFormTextNode.textContent = otpTextArray.join(phoneNumber);
  }
  function disableLinkOtpResend() {
    otpLinkResendNode.style.pointerEvents = 'none';
    otpLinkResendNode.style.color = 'lightgrey';
  }
  function enableLinkOtpResend() {
    otpLinkResendNode.style.pointerEvents = null;
    otpLinkResendNode.style.color = null;
  }
  var ORIGINAL_OTP_RESEND_TEXT = otpLinkResendNode.textContent;
  function setLinkOtpResendTextTimer(countdownNumber) {
    if (countdownNumber > 0) {
      otpLinkResendNode.textContent = ORIGINAL_OTP_RESEND_TEXT + ' (' + countdownNumber + ')';
    } else {
      otpLinkResendNode.textContent = ORIGINAL_OTP_RESEND_TEXT;
    }
  }


  // --
  // -- TODO: HACKY FLOW
  // if (pageUrlParams.m === '1') {  // Magic param to bypass first step
  //   // Show enroll form
  //   showEmailFormDone();
  //   showEnrollForm();
  // }
  // If email param supplied in page (user clicks from welcome email after subscribing)
  if (pageUrlParams.m) {
    // TODO: query server api to check if handle exists
  }


  // -- Logic functions and code
  // Input validation
  function isValidName(name) { return /^[a-zA-Z]+(\s?[a-zA-Z])*$/.test(name); }
  function isValidPhoneNumber(number) { return /^[9863]\d{7}$/.test(number); }
  
  // Flags
  var otpIsOnCooldown = false;

  // OTP cooldown (sets flag to true when OTP send/resend on cooldown)
  function setOtpCooldown(onStart, onInterval, onFinish) {  // optional callback params (called back with remaining seconds)
    function onCooldownStart(seconds) {  // Gets called before onStart callback
      // When cooldown starts, do..
      setEnrollFormSubmitInactive();
      setEnrollFormSubmitTimer(seconds);
      disableLinkOtpResend();
      setLinkOtpResendTextTimer(seconds);
    }
    function onCooldownInterval(seconds) { // Gets called before onInterval callback
      // When cooldown is ticking, do..
      setLinkOtpResendTextTimer(seconds);
      setEnrollFormSubmitTimer(seconds);
    }
    function onCooldownFinish(seconds) { // Gets called before onFinish callback
      // When cooldown finishes, do..
      setEnrollFormSubmitActive();
      enableLinkOtpResend();
    }

    if (otpIsOnCooldown) { return; }  // Exit function if OTP still on cooldown when function called
    var remainingSeconds = OTP_COOLDOWN_DURATION;
    otpIsOnCooldown = true;
    onCooldownStart(remainingSeconds);
    if (typeof onStart === 'function') {
      onStart(remainingSeconds);
    }
    var otpCooldownTimer = setInterval(function () {
      remainingSeconds--;
      onCooldownInterval(remainingSeconds);
      if (typeof onInterval === 'function') { onInterval(remainingSeconds); }
      if (remainingSeconds <= 0) {
        otpIsOnCooldown = false;
        clearInterval(otpCooldownTimer);
        onCooldownFinish(remainingSeconds);
        if (typeof onFinish === 'function') { onFinish(remainingSeconds); }
      }
    }, 1000);
  }
  // --


  // -- DOM interaction listeners
  // On email submit
  emailFormNode.onclick = function (e) {
    if (!emailFormInputNode.checkValidity()) {  // note: use own checking logic to bypass default email check
      return;
    }
    e.preventDefault();

    // Prepare data for sending
    var postData = {
      email: emailFormInputNode.value
    };
    if (pageUrlParams.r) {  // Referrer param
      postData.referrer = pageUrlParams.r;
    }

    // Perform API call to server endpoint (Subscribe)
    $.ajax({
      method: 'POST',
      // url: 'http://192.168.0.137:5000/api/referral_campaign/subscribe', // TODO: Change to actual URL values
      url: SERVER_API_BASE_URL + 'referral_campaign/subscribe', // TODO: Change to actual URL values
      data: postData
    })
    .done(function (response) {
      // If handle received from response (user has registered)
      if (response.data && response.data.handle) {
        // Redirect to handle page
        window.location.href = 'https://ratex.webflow.io/rates-refer?h=' + response.data.handle;
      } else {
        showEmailFormDone();
        showEnrollForm();
      }
    })
    .fail(function (jqxhr) {
      // On error, attempt to retrieve `message` field in response for display
      var responseErrorMessage;
      try {
        responseErrorMessage = JSON.parse(jqxhr.responseText).message;
      } catch (error) {
        // Do nothing on error
      }
      // Display message in response if available, default to general failure message
      showEmailFormError(responseErrorMessage || ERROR_GENERAL_FAILURE);
    });

    showEmailFormProcessing();
  };

  // Setup input listeners (alternatively may use onkeyup event)
  enrollFormInputNameNode.oninput = function (e) {
    if (isValidName(e.target.value)) {
      e.target.setCustomValidity('');
    } else {
      e.target.setCustomValidity(ERROR_INVALID_NAME);
    }
  }
  enrollFormInputPhoneNumberNode.oninput = function (e) {
    if (isValidPhoneNumber(e.target.value)) {
      e.target.setCustomValidity('');
    } else {
      e.target.setCustomValidity(ERROR_INVALID_PHONE_NUMBER);
    }
  }
  // On enroll form submit
  enrollFormSubmitButtonNode.onclick = function (e) {
    // Exit function if any of the form fields not valid
    if (!(enrollFormInputNameNode.checkValidity() && enrollFormInputPhoneNumberNode.checkValidity())) {
      return;
    }
    e.preventDefault(); // note: this prevents the custom validity message from showing

    // Prepare data for sending
    var postData = {
      email: emailFormInputNode.value,
      name: enrollFormInputNameNode.value,
      phone_no: enrollFormInputPhoneNumberNode.value
    };
    if (pageUrlParams.r) {
      postData.referrer = pageUrlParams.r;
    }

    // Perform API call to server endpoint (Enroll)
    $.ajax({
      method: 'POST',
      url: SERVER_API_BASE_URL + 'referral_campaign', // TODO: Change to actual URL values
      data: postData
    })
    .done(function (response) {
      hideEnrollForm();
      setOtpFormTextPhoneNumber(postData.phone_no);
      showOtpForm();
      setOtpCooldown();
    })
    .fail(function (jqxhr) {
      // On error, attempt to retrieve `message` field in response for display
      var responseErrorMessage;
      try {
        responseErrorMessage = JSON.parse(jqxhr.responseText).message;
      } catch (error) {
        // Do nothing on error
      }
      // Display message in response if available, default to general failure message
      showEnrollFormError(responseErrorMessage || ERROR_GENERAL_FAILURE);
    });

    showEnrollFormProcessing();
  };

  // TODO: On OTP submit
  otpFormSubmitNode.onclick = function (e) {
    var inputTokenValue = otpFormInputNode.value;
    // Exit if otp field falsey (i.e. empty string)
    if (!inputTokenValue) {
      return;
    }
    e.preventDefault();

    // Prepare data for sending
    var postData = {
      email: emailFormInputNode.value,
      name: enrollFormInputNameNode.value,
      phone_no: enrollFormInputPhoneNumberNode.value,
      token: otpFormInputNode.value
    };
    if (pageUrlParams.r) {
      postData.referrer = pageUrlParams.r;
    }

    // Perform API call to server endpoint (Verify OTP)
    $.ajax({
      method: 'POST',
      url: SERVER_API_BASE_URL + 'referral_campaign',
      data: postData,
    })
    .done(function (response) {
      var handle = response.data.handle;
      window.location.href = 'https://ratex.webflow.io/rates-refer?h=' + handle;
    })
    .fail(function (jqxhr) {
      // Clear OTP input field
      otpFormInputNode.value = '';

      // On error, attempt to retrieve `message` field in response for display
      var responseErrorMessage;
      try {
        responseErrorMessage = JSON.parse(jqxhr.responseText).message;
      } catch (error) {
        // Do nothing on error
      }
      // Display message in response if available, default to general failure message
      showOtpFormError(responseErrorMessage || ERROR_GENERAL_FAILURE);
    });

    showOtpFormProcessing();
  };

  // Onclick resend
  otpLinkResendNode.onclick = function () {
    // COPY-PASTED FROM EnrollFormSubmit onclick
    // Prepare data for sending
    var postData = {
      email: emailFormInputNode.value,
      name: enrollFormInputNameNode.value,
      phone_no: enrollFormInputPhoneNumberNode.value
    };
    if (pageUrlParams.r) {
      postData.referrer = pageUrlParams.r;
    }

    // Perform API call to server endpoint (Resend) -> same as enroll
    $.ajax({
      method: 'POST',
      url: SERVER_API_BASE_URL + 'referral_campaign', // TODO: Change to actual URL values
      data: postData
    })
      .done(function (response) {
        hideEnrollForm();
        setOtpFormTextPhoneNumber(postData.phone_no);
        showOtpForm();
        setOtpCooldown();
      })
      .fail(function (jqxhr) {
        // Re-enable link to resend
        enableLinkOtpResend();
        otpLinkResendNode.textContent = ORIGINAL_OTP_RESEND_TEXT;

        // On error, attempt to retrieve `message` field in response for display
        var responseErrorMessage;
        try {
          responseErrorMessage = JSON.parse(jqxhr.responseText).message;
        } catch (error) {
          // Do nothing on error
        }
        // Display message in response if available, default to general failure message
        showOtpFormError(responseErrorMessage || ERROR_GENERAL_FAILURE);
      });
 
    // Show resending
    disableLinkOtpResend();
    otpLinkResendNode.textContent = 'Resending..';
  }

  // On entered wrongly
  otpLinkBackToEnrollNode.onclick = function () {
    hideOtpForm();
    showEnrollForm();
    enableEnrollFormInputs();
  }
  // --
});

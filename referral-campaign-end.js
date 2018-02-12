// On document ready
$(function () {
  // Configurations
  // const WEBSITE_BASE_URL = 'https://ratex.webflow.io/'; // staging
  const WEBSITE_BASE_URL = 'https://www.ratex.co/'; // production
  const WEBSITE_RATES_REFER_URL = WEBSITE_BASE_URL + 'rates-refer'; // user points
  // const SERVER_API_BASE_URL = 'https://staging.ratex.co/api/';  // staging
  const SERVER_API_BASE_URL = 'https://ratex.co/api/';  // production

  // -- DOM node references
  // Email form node references
  const emailFormNode = document.getElementById('wf-form-enter-email');
  const emailFormInputNode = document.getElementById('input-email');
  const emailFormSubmitButtonNode = document.getElementById('submit-email');
  const emailFormBlockNode = emailFormNode.parentNode;
  const emailFormFeedbackFailNode = emailFormBlockNode.querySelector('.w-form-fail');
  const emailFormFeedbackFailMessageNode = emailFormFeedbackFailNode.querySelector('div');
  // --

  // Save original texts
  const ORIGINAL_EMAIL_SUBMIT_BUTTON_TEXT = emailFormSubmitButtonNode.value;
  const ORIGINAL_EMAIL_FORM_FEEDBACK_FAIL_TEXT = emailFormFeedbackFailMessageNode.innerText;

  // Custom output text
  const ERROR_GENERIC = 'Oops! Something went wrong! Please try again';


  // -- DOM manipulation functions
  // Email form
  function disableEmailFormElements() {
    emailFormInputNode.setAttribute('disabled', true);
    emailFormSubmitButtonNode.setAttribute('disabled', true);
  }
  function enableEmailFormElements() {
    emailFormInputNode.removeAttribute('disabled', true);
    emailFormSubmitButtonNode.removeAttribute('disabled', true);
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

  // emailFormNode.onclick = function (e) {
  emailFormSubmitButtonNode.onclick = function (e) {
    if (!emailFormInputNode.checkValidity()) {  // note: use own checking logic to bypass default email check
      return;
    }
    e.preventDefault();

    // Perform API call to server endpoint (check whether handle exists)
    $.ajax({
      method: 'POST', // TODO: input method e.g. GET or POST
      url: SERVER_API_BASE_URL + 'referral_campaign/getHandle',  // TODO: input new URL
      data: {
        email: emailFormInputNode.value,
      },
    })
    .done(function (response) {
      if (response.data) {
        // If handle available,
        if (response.data.handle) {
          // Redirect to rates-refer page
          window.location.href = WEBSITE_RATES_REFER_URL + '?h=' + response.data.handle;
        } else {
          showEmailFormError(ORIGINAL_EMAIL_FORM_FEEDBACK_FAIL_TEXT);
        }
      } else {
        // Response data not available, display generic error
        showEmailFormError(ERROR_GENERIC);
      }
    })
    .fail(function (jqxhr) {
      showEmailFormError(ERROR_GENERIC); // show generic error
    });

    showEmailFormProcessing();
  }
});

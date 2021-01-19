// On document ready
$(function () {
  // Retrieve referral code
  const urlSearchParams = new URLSearchParams(window.location.search);
  const referralCode = urlSearchParams.get("referral_code");
  const referralCodeElement = document.getElementById("referral-code");
  if (referralCodeElement) {
    referralCodeElement.innerText = referralCode;
    referralCodeElement.style.opacity = 1;
  }

  // Forms
  class FormValidityManager {
    _isInitialized = false;
    _fieldsValidity = [];
    _lastFieldsValidity = [];
    _lastFormValidState = null;
    _validityChangeCallback = null;
    _unsubscribeAllFieldInputFn = null;

    _getFormElement = () => document.getElementById(this.formId);
    _getFormFieldElements = () => {
      const formElement = this._getFormElement();
      return this.fieldConfigs.map((fieldConfig) =>
        formElement.querySelector(`input[name="${fieldConfig.name}"]`)
      );
    };
    _updateFormValidState = () => {
      // Handle Fields Validity
      const formFieldElements = this._getFormFieldElements();
      this._fieldsValidity.forEach((fieldValidity, index) => {
        console.log(
          "zz:",
          index,
          this._lastFieldsValidity[index],
          fieldValidity
        );
        const shouldTriggerFieldValidityChangeListener =
          this._lastFieldsValidity[index] !== fieldValidity;
        this._lastFieldsValidity[index] = fieldValidity;
        if (
          shouldTriggerFieldValidityChangeListener &&
          typeof this.fieldConfigs[index].onValidityChange === "function"
        ) {
          this.fieldConfigs[index].onValidityChange(
            fieldValidity,
            formFieldElements[index]
          );
        }
      });

      // Handle Form Validity
      const currentFormValidState = this.getFormValidState();
      const shouldTriggerValidityChangeListener =
        currentFormValidState !== this._lastFormValidState;
      this._lastFormValidState = currentFormValidState;
      if (
        shouldTriggerValidityChangeListener &&
        typeof this._validityChangeCallback === "function"
      ) {
        this._validityChangeCallback(currentFormValidState);
      }
    };

    /**
     * Constructor
     * @param {string} formId id attribute value for form.
     * @param {Array<{ name: string; validator: (value: string) => boolean; onValidityChange?: (isValid: boolean, fieldElement: HTMLInputElement) => void; }>} fieldConfigs Form field config
     */
    constructor(formId, fieldConfigs) {
      this.formId = formId;
      this.fieldConfigs = fieldConfigs;
    }

    initialize = () => {
      if (this._isInitialized) {
        console.warn(`Form id ${this.formId} already initialized.`);
        return;
      }

      const formElement = this._getFormElement();
      if (!formElement) {
        console.warn(`Form id ${this.formId} does not exist.`);
        return;
      }
      const formFieldElements = this._getFormFieldElements();
      if (formFieldElements.findIndex((element) => element === null) !== -1) {
        // Specified form config does not match DOM. Exit with warning
        console.warn(`Form id ${this.formId} has missing field input(s).`);
        return;
      }

      const unsubscribeFunctions = [];
      formFieldElements.forEach((fieldElement, fieldElementIndex) => {
        // Set up input field listeners
        const inputEventHandler = (event) => {
          const value = event.target.value;
          this._fieldsValidity[fieldElementIndex] = this.fieldConfigs[
            fieldElementIndex
          ].validator
            ? this.fieldConfigs[fieldElementIndex].validator(value)
            : true; // no validator for field - always `true` (valid)

          this._updateFormValidState();
        };
        fieldElement.addEventListener("input", inputEventHandler);
        unsubscribeFunctions.push(() => {
          fieldElement.removeEventListener("input", inputEventHandler);
        });

        // First-run field validators
        this._fieldsValidity[fieldElementIndex] = this.fieldConfigs[
          fieldElementIndex
        ].validator
          ? this.fieldConfigs[fieldElementIndex].validator(fieldElement.value)
          : true; // no validator for field - always `true` (valid)
      });

      this._unsubscribeAllFieldInputFn = () => {
        unsubscribeFunctions.forEach((fn) => {
          fn();
        });
      };
      this._isInitialized = true;

      // Return current initialized form validity state
      return this.getFormValidState();
    };

    deinitialize = () => {
      if (this._isInitialized) {
        this._unsubscribeAllFieldInputFn();
        this._validityChangeCallback = null;
        this._isInitialized = false;
      }
    };

    getFormValidState = () =>
      this._fieldsValidity.length === 0
        ? true
        : this._fieldsValidity.findIndex(
            (fieldValidity) => fieldValidity === false
          ) === -1; // form not valid if >= 1 field validity == `false`

    onValidityChange = (callback) => {
      this._validityChangeCallback = callback;
    };

    forceValidityUpdate = () => {
      const formFieldElements = this._getFormFieldElements();
      formFieldElements.forEach((fieldElement, fieldElementIndex) => {
        this._fieldsValidity[fieldElementIndex] = this.fieldConfigs[
          fieldElementIndex
        ].validator
          ? this.fieldConfigs[fieldElementIndex].validator(fieldElement.value)
          : true; // no validator for field - always `true` (valid)
      });

      this._updateFormValidState();
    };

    getFormData = () => {
      const formElement = this._getFormElement();
      return formElement ? new FormData(formElement) : null;
    };
  }

  // Setup for Button loading indicator
  // ref: https://loading.io/css/
  const BUTTON_LOADING_INDICATOR_COLOR = "#9c9c9c";
  const BUTTON_LOADING_INDICATOR_SIZE = 32;
  const RESEND_LOADING_INDICATOR_COLOR = "#9e9e9e";
  const RESEND_LOADING_INDICATOR_SIZE = 16;

  const loadingIndicatorStyleElement = document.createElement("style");
  loadingIndicatorStyleElement.setAttribute("type", "text/css");
  loadingIndicatorStyleElement.innerHTML = `
/** General loading indicator styling */
.lds-ring {
  display: inline-block;
  position: relative;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/** Button loading indicator styling */
.button-spinner-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  align-items: center;
}
.button-spinner-wrapper .lds-ring {
  width: ${BUTTON_LOADING_INDICATOR_SIZE}px;
  height: ${BUTTON_LOADING_INDICATOR_SIZE}px;
}
.button-spinner-wrapper .lds-ring div {
  width: ${BUTTON_LOADING_INDICATOR_SIZE}px;
  height: ${BUTTON_LOADING_INDICATOR_SIZE}px;
  border: ${
    BUTTON_LOADING_INDICATOR_SIZE / 8
  }px solid ${BUTTON_LOADING_INDICATOR_COLOR};
  border-color: ${BUTTON_LOADING_INDICATOR_COLOR} transparent transparent transparent;
}

/** Resend otp loading indicator styling */
.resend-spinner {
  display: inline;
  vertical-align: middle;
}
.resend-spinner .lds-ring {
  width: ${RESEND_LOADING_INDICATOR_SIZE}px;
  height: ${RESEND_LOADING_INDICATOR_SIZE}px;
}
.resend-spinner .lds-ring div {
  width: ${RESEND_LOADING_INDICATOR_SIZE}px;
  height: ${RESEND_LOADING_INDICATOR_SIZE}px;
  border: ${
    RESEND_LOADING_INDICATOR_SIZE / 8
  }px solid ${RESEND_LOADING_INDICATOR_COLOR};
  border-color: ${RESEND_LOADING_INDICATOR_COLOR} transparent transparent transparent;
}`;
  document
    .getElementsByTagName("head")[0]
    .appendChild(loadingIndicatorStyleElement);

  class Button {
    _showLoading = false;
    _canClick = true;
    _getElement = () => document.getElementById(this._buttonId);
    _updateClickableState = () => {
      const element = this._getElement();
      if (!element) {
        return;
      }

      const clickable = this._canClick && !this._showLoading;
      if (clickable) {
        element.style.pointerEvents = "";
        element.style.cursor = "";
        element.style.backgroundColor = "";
        element.style.color = "";
        element.style.boxShadow = "";
      } else {
        element.style.pointerEvents = "none";
        element.style.cursor = "default";
        element.style.backgroundColor = "#bcc2c6";
        element.style.color = this._showLoading ? "transparent" : "#79868e";
        element.style.boxShadow = "none";
      }
    };

    /**
     * Constructor
     * @param {string} buttonId
     */
    constructor(buttonId) {
      this._buttonId = buttonId;

      const element = this._getElement();
      if (element) {
        this._innerHTML = element.innerHTML;
      }
    }

    setOnClick = (callback) => {
      const element = this._getElement();
      if (element) {
        element.onclick = (event, ...params) => {
          event.preventDefault();
          if (typeof callback === "function") {
            callback(...params);
          }
        };
      }
    };

    setClickable = (canClick) => {
      this._canClick = canClick;
      this._updateClickableState();
    };

    setShowLoading = (showLoading) => {
      const element = this._getElement();
      if (!element) {
        return;
      }

      this._showLoading = showLoading;
      if (showLoading) {
        element.style.color = "transparent";
        element.innerHTML = `${this._innerHTML}<div class="button-spinner-wrapper">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>`;
      } else {
        element.innerHTML = this._innerHTML;
        element.style.color = "";
      }

      this._updateClickableState();
    };

    /**
     * Set button text.
     * @param {string} text Text content for button.
     * @param {boolean} [showRightChevron] show right chevron.
     */
    setText = (text, showRightChevron) => {
      const element = this._getElement();
      if (!element) {
        return;
      }

      const formattedText = text.replace(" ", "&nbsp;"); // force white-space to be non-breaking
      element.innerHTML = formattedText;
      this._innerHTML = formattedText;
    };
  }

  const BOTTOM_BUTTON_ELEMENT_ID = "next-button";
  const bottomButton = new Button(BOTTOM_BUTTON_ELEMENT_ID);

  // Step 2 (Phone)
  const PHONE_NUMBER_FORM_ID = "phone-form";
  const phoneFormElement = document.getElementById(PHONE_NUMBER_FORM_ID);
  const PHONE_NUMBER_INPUT_ID = "phone-input";
  const PHONE_NUMBER_INPUT_NAME = "phone";
  const phoneFormPhoneInputElement = document.getElementById(
    PHONE_NUMBER_INPUT_ID
  );
  const phoneInputIntlInstance = window.intlTelInputGlobals.getInstance(
    phoneFormPhoneInputElement
  );
  const PHONE_NUMBER_INVALID_MESSAGE_ID = "invalid-phone-error";
  const phoneNumberInvalidMessageElement = document.getElementById(
    PHONE_NUMBER_INVALID_MESSAGE_ID
  );
  const showPhoneNumberInvalidMessage = (message) => {
    phoneNumberInvalidMessageElement.innerText = message;
    phoneNumberInvalidMessageElement.style.visibility = "";
    phoneFormPhoneInputElement.style.borderColor = "red";
  };
  const hidePhoneNumberInvalidMessage = () => {
    phoneNumberInvalidMessageElement.style.visibility = "hidden";
    phoneFormPhoneInputElement.style.borderColor = "";
  };
  const phoneFormManager = new FormValidityManager(PHONE_NUMBER_FORM_ID, [
    {
      name: PHONE_NUMBER_INPUT_NAME,
      validator: (value) =>
        /^[+]?\d+$/.test(value) && phoneInputIntlInstance.isValidNumber(),
    },
  ]);

  // Step 3 (OTP)
  const OTP_PHONE_NUMBER_TEXT_ID = "otp-phone-number";
  const otpPhoneNumberTextElement = document.getElementById(
    OTP_PHONE_NUMBER_TEXT_ID
  );
  const OTP_FORM_ID = "otp-form";
  const otpFormElement = document.getElementById(OTP_FORM_ID);
  const OTP_INPUT_ID = "otp-input";
  const OTP_INPUT_NAME = "otp";
  const otpInputElement = document.getElementById(OTP_INPUT_ID);
  const OTP_INVALID_MESSAGE_ID = "invalid-otp-error";
  const otpInvalidMessageElement = document.getElementById(
    OTP_INVALID_MESSAGE_ID
  );
  const showOtpInvalidMessage = (message) => {
    otpInvalidMessageElement.innerText = message;
    otpInvalidMessageElement.style.visibility = "";
    otpInputElement.style.borderColor = "red";
  };
  const hideOtpInvalidMessage = () => {
    otpInvalidMessageElement.style.visibility = "hidden";
    otpInputElement.style.borderColor = "";
  };
  const otpFormManager = new FormValidityManager(OTP_FORM_ID, [
    {
      name: OTP_INPUT_NAME,
      validator: (value) => value && value.length === 6,
    },
  ]);
  const OTP_COOLDOWN_BUTTON_ID = "otp-cooldown";
  const otpResendButtonElement = document.getElementById(
    OTP_COOLDOWN_BUTTON_ID
  );
  const setOtpResendButtonElementDisabled = (disabled) => {
    if (disabled) {
      otpResendButtonElement.setAttribute("tabIndex", "-1");
      otpResendButtonElement.style.pointerEvents = "none";
      otpResendButtonElement.style.cursor = "default";
    } else {
      otpResendButtonElement.setAttribute("tabIndex", "0");
      otpResendButtonElement.style.pointerEvents = "";
      otpResendButtonElement.style.cursor = "";
    }
  };
  const OTP_COOLDOWN_TIMER_TEXT_ID = "cooldown-timer";
  const otpCooldownTimerTextElement = document.getElementById(
    OTP_COOLDOWN_TIMER_TEXT_ID
  );

  // Step 4 (Manual apply referral)
  const REFERRAL_FORM_ID = "referral-form";
  const referralFormElement = document.getElementById(REFERRAL_FORM_ID);
  const REFERRAL_INPUT_ID = "referral-input";
  const REFERRAL_INPUT_NAME = "referral";
  const referralInputElement = document.getElementById(REFERRAL_INPUT_ID);
  const REFERRAL_INVALID_MESSAGE_ID = "invalid-referral-error";
  const referralInvalidMessageElement = document.getElementById(
    REFERRAL_INVALID_MESSAGE_ID
  );
  const showReferralInvalidMessage = (message) => {
    referralInvalidMessageElement.innerText = message;
    referralInvalidMessageElement.style.visibility = "";
    referralInputElement.style.borderColor = "red";
  };
  const hideReferralInvalidMessage = () => {
    referralInvalidMessageElement.style.visibility = "hidden";
    referralInputElement.style.borderColor = "";
  };
  const referralFormManager = new FormValidityManager(REFERRAL_FORM_ID, [
    {
      name: REFERRAL_INPUT_NAME,
      validator: (value) => !!value && value.length > 0,
    },
  ]);

  class SectionFlowManager {
    _currentSectionIndex = 0;
    _sectionsConfig = [];
    _currentSectionCleanup = undefined; // variable to hold section setup's cleanup function

    _handleSectionChange = (sectionIndex) => {
      if (sectionIndex >= this._sectionsConfig.length) {
        return; // attempting to access out-of-bounds section
      }

      if (typeof this._currentSectionCleanup === "function") {
        this._currentSectionCleanup();
        this._currentSectionCleanup = undefined;
      }

      this._displaySectionIndex(sectionIndex);
      this._currentSectionIndex = sectionIndex;

      if (typeof this._sectionsConfig[sectionIndex]?.setupFn === "function") {
        this._currentSectionCleanup = this._sectionsConfig[
          sectionIndex
        ].setupFn();
      }
    };
    _displaySectionIndex = (sectionIndex) => {
      // Hide all sections content (prevent flickering)
      this._sectionsConfig.forEach((sectionConfig, index) => {
        const sectionElement = document.getElementById(sectionConfig.id);
        if (sectionElement && index !== sectionIndex) {
          sectionElement.style.display = "none";
        }
      });

      // Show specified section content
      const toShowSectionElement = document.getElementById(
        this._sectionsConfig[sectionIndex].id
      );
      if (toShowSectionElement) {
        toShowSectionElement.style.display = "";
      }
    };

    /**
     * Constructor
     * @param {Array<{ id: string; setupFn?: () => (() => undefined) | undefined }>} sectionsConfig id attribute value for section.
     * @param {Array<{ name: string; validator: (value: string) => boolean; }>} fieldConfigs Form field config
     */
    constructor(sectionsConfig) {
      if (Array.isArray(sectionsConfig)) {
        this._sectionsConfig = sectionsConfig;
      }
    }

    start = () => {
      this._currentSectionIndex = 0;
      this._handleSectionChange(this._currentSectionIndex);
    };

    goToNextSection = () => {
      if (this._currentSectionIndex < this._sectionsConfig.length) {
        this._handleSectionChange(this._currentSectionIndex + 1);
      }
    };

    goToPreviousSection = () => {
      if (this._currentSectionIndex > 0) {
        this._handleSectionChange(this._currentSectionIndex - 1);
      }
    };

    goToSectionId = (id) => {
      const sectionIndex = this._sectionsConfig.findIndex(
        (section) => section.id === id
      );
      if (sectionIndex !== -1) {
        this._handleSectionChange(sectionIndex);
      }
    };
  }

  class Countdown {
    _interval = null;
    _onTickCallback = null;

    /**
     * Constructor
     * @param {number} seconds Initial seconds for countdown.
     */
    constructor(seconds) {
      this.setSeconds(seconds);
    }

    setSeconds = (seconds) => {
      this._seconds = Math.max(0, seconds || 0);
      this.clearTimer();
    };

    start = () => {
      console.log("timer started:", this._seconds);
      let secondsLeft = this._seconds;
      if (secondsLeft > 0) {
        if (typeof this._onTickCallback === "function") {
          this._onTickCallback(secondsLeft);
        }
        this._interval = setInterval(() => {
          secondsLeft -= 1;

          if (typeof this._onTickCallback === "function") {
            this._onTickCallback(secondsLeft);
          }

          if (secondsLeft === 0) {
            this.clearTimer();
          }
        }, 1000);
      }
    };

    clearTimer = () => {
      if (typeof this._interval === "number") {
        clearInterval(this._interval);
      }
    };

    setOnTick = (callback) => {
      this._onTickCallback = callback;
    };
  }

  const API_BASE_URL =
    location.hostname === "ratesapp.co.id"
      ? "https://ratesapp.co.id"
      : "https://staging.ratesapp.co.id/rs/api"; // staging
  const GLOBAL_API_REQUEST_HEADERS = {
    "Accept-Language": "id-ID",
  };

  // Data variables
  let otpPhoneNumber = "";
  let otpResendCooldown = 0;
  let userToken = null;

  const logout = () => {
    $.ajax({
      method: "DELETE",
      url: `${API_BASE_URL}/users/sessions`,
      headers: {
        ...GLOBAL_API_REQUEST_HEADERS,
        Authorization: `Bearer ${userToken}`,
      },
    });
    userToken = null;
  };

  // Set up section flow interaction
  const sectionFlowManager = new SectionFlowManager([
    {
      id: "step-1",
      setupFn: () => {
        bottomButton.setText("Mulai");
        bottomButton.setOnClick(() => {
          sectionFlowManager.goToNextSection();
        });
      },
    },
    {
      id: "step-2",
      setupFn: () => {
        // Set up listener to track country code selection changes
        // ref: https://github.com/jackocnr/intl-tel-input#events
        const handlePhoneFormInputCountryChangeEvent = () => {
          hidePhoneNumberInvalidMessage(); // hide submission error message
          phoneFormManager.forceValidityUpdate(); // force-validate fields again on country change
        };
        phoneFormPhoneInputElement.addEventListener(
          "countrychange",
          handlePhoneFormInputCountryChangeEvent
        );
        const cleanupPhoneFormInputCountryChangeEventListener = () => {
          phoneFormPhoneInputElement.removeEventListener(
            "countrychange",
            handlePhoneFormInputCountryChangeEvent
          );
        };
        // Set up listener to track input interaction
        const handlePhoneFormInputChangeEvent = () => {
          hidePhoneNumberInvalidMessage(); // hide submission error message
        };
        phoneFormPhoneInputElement.addEventListener(
          "input",
          handlePhoneFormInputChangeEvent
        );
        const cleanupPhoneFormInputChangeEventListener = () => {
          phoneFormPhoneInputElement.removeEventListener(
            "input",
            handlePhoneFormInputChangeEvent
          );
        };

        let phoneFormIsProcessing = false;
        const setPhoneFormProcessing = (isProcessing) => {
          phoneFormIsProcessing = isProcessing;
          bottomButton.setShowLoading(isProcessing);
          if (isProcessing) {
            phoneFormPhoneInputElement.setAttribute("readonly", true);
          } else {
            phoneFormPhoneInputElement.removeAttribute("readonly");
          }
        };
        const handleNextClick = () => {
          if (
            phoneFormIsProcessing ||
            !phoneInputIntlInstance.isValidNumber()
          ) {
            return;
          }

          hidePhoneNumberInvalidMessage();
          setPhoneFormProcessing(true);

          // Get international phone number
          const e164PhoneNumber = phoneInputIntlInstance.getNumber();
          console.log(e164PhoneNumber);

          // TODO: Remove test code
          // Simulate API call success
          // setTimeout(() => {
          //   otpPhoneNumber = "+6596153967";
          //   otpResendCooldown = 30;

          //   setPhoneFormProcessing(false);
          //   sectionFlowManager.goToNextSection();
          //   // showPhoneNumberInvalidMessage("Unrecognized phone number");
          // }, 3000);

          $.ajax({
            method: "POST",
            url: `${API_BASE_URL}/v2/users/sessions/otp/new`,
            headers: GLOBAL_API_REQUEST_HEADERS,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
              phoneNumber: e164PhoneNumber,
            }),
            success: (data) => {
              setPhoneFormProcessing(false);
              const {
                data: { cooldownLeft },
              } = data;
              otpPhoneNumber = e164PhoneNumber;
              otpResendCooldown = cooldownLeft;

              sectionFlowManager.goToNextSection();
            },
            error: (jqXHR) => {
              setPhoneFormProcessing(false);

              let errorMessage = jqXHR?.responseJSON?.message;
              if (!errorMessage) {
                errorMessage = "TODO:Default error message";
              }

              showPhoneNumberInvalidMessage(errorMessage);
            },
          });
        };
        phoneFormElement.onsubmit = (event) => {
          event.preventDefault();
          handleNextClick();
        };

        bottomButton.setText("Lanjut");
        bottomButton.setOnClick(handleNextClick);

        phoneFormManager.onValidityChange((formIsValid) => {
          if (!phoneFormIsProcessing) {
            bottomButton.setClickable(formIsValid);
          }
        });
        phoneFormManager.initialize();
        bottomButton.setClickable(phoneFormManager.getFormValidState());

        return () => {
          cleanupPhoneFormInputCountryChangeEventListener();
          cleanupPhoneFormInputChangeEventListener();
          phoneFormManager.deinitialize();
        };
      },
    },
    {
      id: "step-3",
      setupFn: () => {
        if (otpPhoneNumberTextElement) {
          otpPhoneNumberTextElement.innerText = otpPhoneNumber;
        }

        // Set up listener to track input interaction
        const handleOtpInputChangeEvent = () => {
          hideOtpInvalidMessage(); // hide submission error message
        };
        otpInputElement.addEventListener("input", handleOtpInputChangeEvent);
        const cleanupOtpInputChangeEventListener = () => {
          otpInputElement.removeEventListener(
            "input",
            handleOtpInputChangeEvent
          );
        };

        let otpIsResending = false;
        let otpFormIsProcessing = false;
        const setOtpFormProcessing = (isProcessing) => {
          otpFormIsProcessing = isProcessing;
          bottomButton.setShowLoading(isProcessing);
          if (isProcessing) {
            otpInputElement.setAttribute("readonly", true);
          } else {
            otpInputElement.removeAttribute("readonly");
          }
        };
        const setOtpResending = (isResending) => {
          otpIsResending = isResending;
          if (isResending) {
            otpCooldownTimerTextElement.innerHTML = `<div class="resend-spinner">
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
              </div>`;
            setOtpResendButtonElementDisabled(true);
          } else {
            otpCooldownTimerTextElement.innerHTML = "";
            setOtpResendButtonElementDisabled(false);
          }
        };

        // Submit OTP logic
        const handleNextClick = () => {
          if (otpFormIsProcessing) {
            return;
          }

          hideOtpInvalidMessage();
          setOtpFormProcessing(true);

          const otpFormData = otpFormManager.getFormData();

          // TODO: Remove simulation
          // setTimeout(() => {
          //   userToken =
          //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTA5NTk0MzUsInN1YiI6ImU2OFpkK2FmK2tac3NOcUhWYzFFMmVXOG5YVWhJZFBmYlkwcVk0RXQ3MFE9In0.oqSfmU83ZZF0Wfynau1dYMuMY8hXwz49do_j_C3p3l4";

          //   setOtpFormProcessing(false);
          //   console.log('otp:', otpFormData?.get(OTP_INPUT_NAME));
          //   sectionFlowManager.goToSectionId("step-4");

          //   // $.ajax({
          //   //   method: "POST",
          //   //   url: `${API_BASE_URL}/v2/users/me/use-referral-code`,
          //   //   headers: {
          //   //     ...GLOBAL_API_REQUEST_HEADERS,
          //   //     Authorization: `Bearer ${userToken}`,
          //   //   },
          //   //   dataType: "json",
          //   //   contentType: "application/json",
          //   //   data: JSON.stringify({
          //   //     code: referralCode,
          //   //   }),
          //   //   success: (data) => {
          //   //     setOtpFormProcessing(false);

          //   //     // logout();

          //   //     // TODO: Go to next page
          //   //     window.alert("TODO: Go to next page");
          //   //   },
          //   //   error: (jqXHR) => {
          //   //     setOtpFormProcessing(false);
          //   //     const errorStatus = jqXHR.status;
          //   //     const errorPayload = jqXHR.responseJSON;
          //   //     const errorData = errorPayload.data;

          //   //     if (errorStatus === 422) {
          //   //       const serverErrorCode = errorData?.code;
          //   //       if (serverErrorCode === 1533) {
          //   //         // Already used referral code
          //   //         // sectionFlowManager.goToSectionId("step-4a");
          //   //         sectionFlowManager.goToSectionId("step-4");
          //   //         logout();
          //   //         return;
          //   //       }
          //   //     }

          //   //     // Default handling
          //   //     sectionFlowManager.goToNextSection();
          //   //   },
          //   // });
          // }, 3000);

          $.ajax({
            method: "POST",
            url: `${API_BASE_URL}/v2/users/sessions/otp/auth`,
            headers: GLOBAL_API_REQUEST_HEADERS,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
              phoneNumber: otpPhoneNumber,
              otp: otpFormData?.get(OTP_INPUT_NAME),
            }),
            success: (data) => {
              const {
                data: { _token },
              } = data;
              userToken = _token;

              // Apply referral code
              $.ajax({
                method: "POST",
                url: `${API_BASE_URL}/v2/users/me/use-referral-code`,
                headers: {
                  ...GLOBAL_API_REQUEST_HEADERS,
                  Authorization: `Bearer ${userToken}`,
                },
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                  code: referralCode,
                }),
                success: (data) => {
                  // Note: Retain form processing state to disable interaction while navigating to next page

                  logout();

                  // Go to next page
                  location.assign(
                    "https://rates-reseller.webflow.io/signup-success"
                  );
                },
                error: (jqXHR) => {
                  setOtpFormProcessing(false);
                  const errorStatus = jqXHR.status;
                  const errorPayload = jqXHR.responseJSON;
                  const errorData = errorPayload.data;

                  if (errorStatus === 422) {
                    const serverErrorCode = errorData?.code;
                    if (serverErrorCode === 1533) {
                      // Already used referral code
                      sectionFlowManager.goToSectionId("step-4a");
                      logout();
                      return;
                    }
                  }

                  // Default handling
                  sectionFlowManager.goToNextSection();
                },
              });
            },
            error: (jqXHR) => {
              setOtpFormProcessing(false);

              let errorMessage = jqXHR?.responseJSON?.message;
              if (!errorMessage) {
                errorMessage = "TODO:";
              }

              showOtpInvalidMessage(errorMessage);
            },
          });
        };

        // Resend OTP logic
        const otpCountdown = new Countdown(otpResendCooldown);
        otpCountdown.setOnTick((secondsLeft) => {
          otpResendCooldown = secondsLeft;

          if (secondsLeft <= 0) {
            otpCooldownTimerTextElement.innerText = "";
            setOtpResendButtonElementDisabled(false);
          } else {
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            otpCooldownTimerTextElement.innerText = ` ${minutes}:${
              seconds < 10 ? `0${seconds}` : seconds
            }`;
            setOtpResendButtonElementDisabled(true);
          }
        });
        otpCountdown.start();

        otpResendButtonElement.onclick = (event) => {
          event.preventDefault();

          if (otpIsResending) {
            return; // do nothing if pressed when OTP is still resending
          }
          if (otpFormIsProcessing) {
            return; // do nothing if pressed when OTP submission is processing
          }
          if (otpResendCooldown > 0) {
            return; // do nothing if resend still on cooldown
          }

          setOtpResending(true);
          // TODO: Remove test code
          // Simulate API call success
          // setTimeout(() => {
          //   setOtpResending(false);
          //   otpResendCooldown = 30;
          //   otpCountdown.setSeconds(otpResendCooldown);
          //   otpCountdown.start();
          // }, 3000);
          $.ajax({
            method: "POST",
            url: `${API_BASE_URL}/v2/users/sessions/otp/new`,
            headers: GLOBAL_API_REQUEST_HEADERS,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
              phoneNumber: otpPhoneNumber,
            }),
            success: (data) => {
              setOtpResending(false);
              const {
                data: { cooldownLeft },
              } = data;
              otpResendCooldown = cooldownLeft;

              otpCountdown.setSeconds(otpResendCooldown);
              otpCountdown.start();
            },
            error: (jqXHR) => {
              setOtpResending(false);

              let errorMessage = jqXHR?.responseJSON?.message;
              if (!errorMessage) {
                errorMessage = "TODO:";
              }

              window.alert(errorMessage);
            },
          });
        };

        otpFormElement.onsubmit = (event) => {
          event.preventDefault();
          handleNextClick();
        };

        bottomButton.setText("Lanjut");
        bottomButton.setOnClick(handleNextClick);

        otpFormManager.onValidityChange((formIsValid) => {
          if (!otpFormIsProcessing) {
            bottomButton.setClickable(formIsValid);
          }
        });
        otpFormManager.initialize();
        bottomButton.setClickable(otpFormManager.getFormValidState());

        return () => {
          otpPhoneNumber = "";
          cleanupOtpInputChangeEventListener();
          otpFormManager.deinitialize();
          otpCountdown.clearTimer();
        };
      },
    },
    {
      id: "step-4",
      setupFn: () => {
        // Set up listener to track input interaction
        const handleReferralInputChangeEvent = () => {
          hideReferralInvalidMessage(); // hide submission error message
        };
        referralInputElement.addEventListener(
          "input",
          handleReferralInputChangeEvent
        );
        const cleanupReferralInputChangeEventListener = () => {
          referralInputElement.removeEventListener(
            "input",
            handleReferralInputChangeEvent
          );
        };

        let referralFormIsProcessing = false;
        const setReferralFormProcessing = (isProcessing) => {
          referralFormIsProcessing = isProcessing;
          bottomButton.setShowLoading(isProcessing);
          if (isProcessing) {
            referralInputElement.setAttribute("readonly", true);
          } else {
            referralInputElement.removeAttribute("readonly");
          }
        };

        // Referral code logic
        const handleNextClick = () => {
          if (referralFormIsProcessing) {
            return;
          }

          hideReferralInvalidMessage();
          setReferralFormProcessing(true);

          // TODO: Remove simulation
          // setTimeout(() => {
          //   setReferralFormProcessing(false);
          //   window.alert("Some error message");
          // }, 3000);

          const referralFormData = referralFormManager.getFormData();

          $.ajax({
            method: "POST",
            url: `${API_BASE_URL}/v2/users/me/use-referral-code`,
            headers: {
              ...GLOBAL_API_REQUEST_HEADERS,
              Authorization: `Bearer ${userToken}`,
            },
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
              code: referralFormData?.get(REFERRAL_INPUT_NAME),
            }),
            success: (data) => {
              // Note: Retain form processing state to disable interaction while navigating to next page

              logout();

              // Go to next page
              location.assign(
                "https://rates-reseller.webflow.io/signup-success"
              );
            },
            error: (jqXHR) => {
              setReferralFormProcessing(false);
              const errorStatus = jqXHR?.status;
              const errorPayload = jqXHR?.responseJSON;
              let errorMessage = errorPayload?.message;
              const errorData = errorPayload?.data;

              if (errorStatus === 422) {
                const serverErrorCode = errorData?.code;
                if (serverErrorCode === 1533) {
                  // Already used referral code
                  sectionFlowManager.goToSectionId("step-4a");
                  logout();
                  return;
                }
              }

              if (!errorMessage) {
                errorMessage = "TODO:";
              }

              showReferralInvalidMessage(errorMessage);
            },
          });
        };

        bottomButton.setText("Lanjut");
        bottomButton.setOnClick(handleNextClick);

        referralFormManager.onValidityChange((formIsValid) => {
          if (!referralFormIsProcessing) {
            bottomButton.setClickable(formIsValid);
          }
        });
        referralFormManager.initialize();
        bottomButton.setClickable(referralFormManager.getFormValidState());

        return () => {
          cleanupReferralInputChangeEventListener();
          referralFormManager.deinitialize();
        };
      },
    },
    {
      id: "step-4a",
      setupFn: () => {
        // TODO:
        bottomButton.setOnClick(() => {
          window.location.assign("https://ratesapp.app.link/Website-N5I8");
        });
        bottomButton.setText("Unduh RateS");
        bottomButton.setClickable(true);
      },
    },
  ]);

  // -- One-time page load initializations --
  hidePhoneNumberInvalidMessage();
  hideOtpInvalidMessage();
  hideReferralInvalidMessage();

  sectionFlowManager.start();

  // Disable default Webflow forms behavior
  // ref: https://forum.webflow.com/t/disabling-form-submission/37752/4
  $(`#${PHONE_NUMBER_FORM_ID}`).submit(function () {
    return false;
  });
  $(`#${OTP_FORM_ID}`).submit(function () {
    return false;
  });
  $(`#${REFERRAL_FORM_ID}`).submit(function () {
    return false;
  });
});

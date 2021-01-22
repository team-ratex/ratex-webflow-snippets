declare const $: any; // jQuery

$(function () {
  // Page functions
  const getURLSearchParams = () => new URLSearchParams(window.location.search);

  // DOM manipulation functions
  // -- Form Input feedback
  const showInputFieldElementError = (
    inputElement: HTMLInputElement,
    errorMessageElement: HTMLElement,
    errorMessage: string
  ) => {
    inputElement.style.borderColor = "red";
    errorMessageElement.innerText = errorMessage;
    errorMessageElement.style.visibility = "";
  };
  const hideInputFieldElementError = (
    inputElement: HTMLInputElement,
    errorMessageElement: HTMLElement
  ) => {
    inputElement.style.borderColor = "";
    errorMessageElement.style.visibility = "hidden";
  };
  // -- Form Input disabled state
  const setInputFieldReadonly = (
    inputElement: HTMLInputElement,
    readonly: boolean
  ) => {
    if (!inputElement) {
      return;
    }
    if (readonly) {
      inputElement.setAttribute("readonly", "true");
    } else {
      inputElement.removeAttribute("readonly");
    }
  };

  // API
  type NetworkRequestHeader = { [headerKey: string]: string };
  interface INetworkResponse<T> {
    status: number;
    data: T;
  }
  class NetworkRequestError extends Error {
    public status: number;
    public data?: unknown;

    constructor(message: string, status: number, data?: unknown) {
      super(message);

      this.status = status;
      this.data = data;
    }
  }
  class NetworkService {
    private baseUrl: string;
    private requestHeaders = {};

    constructor(config: { baseUrl: string; headers?: NetworkRequestHeader }) {
      this.baseUrl = config.baseUrl;
      if (config.headers) {
        this.setHeaders(config.headers);
      }
    }

    public setHeaders = (headers: NetworkRequestHeader) => {
      this.requestHeaders = this.combineHeaders(this.requestHeaders, headers);
    };

    public request = <T>(
      method: "GET" | "POST" | "DELETE",
      url: string,
      config?: {
        baseUrl?: string;
        headers?: NetworkRequestHeader;
        data?: unknown;
      }
    ): Promise<INetworkResponse<T>> => {
      const requestHeaders = config?.headers
        ? this.combineHeaders(this.requestHeaders, config.headers)
        : this.requestHeaders;

      return new Promise((resolve, reject) => {
        $.ajax({
          method,
          url: `${this.baseUrl}${url}`,
          headers: requestHeaders,
          dataType: "json",
          contentType: "application/json",
          ...(typeof config === "object" && "data" in config
            ? { data: JSON.stringify(config.data) }
            : null),
          success: (data, textStatus, jqXHR: XMLHttpRequest) => {
            resolve({
              status: jqXHR.status,
              data,
            });
          },
          error: (jqXHR, textStatus) => {
            reject(
              new NetworkRequestError(
                textStatus,
                jqXHR.status,
                jqXHR?.responseJSON
              )
            );
          },
        });
      });
    };

    private combineHeaders(
      baseHeaders: NetworkRequestHeader | undefined,
      newHeaders: NetworkRequestHeader
    ): NetworkRequestHeader {
      const combinedHeaders = {};

      const copyHeadersToReference = (
        reference: NetworkRequestHeader,
        toCopy: NetworkRequestHeader
      ) => {
        Object.keys(toCopy).forEach((toCopyHeaderKey) => {
          reference[toCopyHeaderKey] = toCopy[toCopyHeaderKey];
        });
      };

      if (baseHeaders) {
        // Copy over existing headers
        copyHeadersToReference(combinedHeaders, baseHeaders);
      }
      copyHeadersToReference(combinedHeaders, newHeaders);

      return combinedHeaders;
    }
  }

  // Section
  interface ISection {
    id: string;
    onActive(): void;
    onInactive(): void;
    getElement(): HTMLElement;
  }
  class Section implements ISection {
    public id: string;

    constructor(id: string) {
      this.id = id;
    }

    public onActive = () => {
      // To override
    };
    public onInactive = () => {
      // To override
    };

    public getElement = () => document.getElementById(this.id);
  }

  // Section Manager
  class SectionManager {
    private currentSectionIndex: number | null = null;
    private sections: ISection[] = [];

    constructor(sections: ISection[]) {
      this.sections = sections;
    }

    public goToSection = (section: ISection | string | number) => {
      let sectionIndexToGoTo: number | void = undefined;
      if (typeof section === "number") {
        sectionIndexToGoTo = section;
      } else {
        sectionIndexToGoTo = this.sections.findIndex((s) =>
          typeof section === "string" ? s.id === section : s === section
        );
      }

      if (
        sectionIndexToGoTo >= 0 &&
        sectionIndexToGoTo < this.sections.length
      ) {
        this.handleGoToSection(sectionIndexToGoTo);
      }
    };

    private handleGoToSection = (sectionIndex: number) => {
      if (sectionIndex >= this.sections.length) {
        return; // attempting to access out-of-bounds section
      }

      if (sectionIndex === this.currentSectionIndex) {
        return;
      }

      // Hide all sections content (prevent flickering)
      this.sections.forEach((_, sectionIndex) => {
        this.setShowSectionIndex(sectionIndex, false);
      });

      // Inactivate current section setup
      if (this.currentSectionIndex !== null) {
        this.sections[this.currentSectionIndex].onInactive();
      }

      const sectionToGoTo = this.sections[sectionIndex];
      this.setShowSectionIndex(sectionIndex, true);
      sectionToGoTo.onActive();

      this.currentSectionIndex = sectionIndex;
    };

    private setShowSectionIndex = (sectionIndex: number, show = true) => {
      const sectionElement = this.sections[sectionIndex].getElement();
      if (sectionElement) {
        sectionElement.style.display = show ? "" : "none";
      }
    };
  }

  // Form
  type FormFieldConfig = {
    name: string;
    validator: (value: string) => boolean;
    onValidityChange?: (
      isValid: boolean,
      fieldElement: HTMLInputElement
    ) => void;
  };
  class FormValidityManager {
    // Internal use only
    private isInitialized = false;
    private fieldsValidity: boolean[] = []; // current validity state
    private lastFieldsValidity: boolean[] = []; // last computed validity state
    private lastFormValidState: boolean | null = null;
    private unsubscribeFieldInputListeners: Function | null; // reference to unsubscribe function for internal listeners

    private formId: string;
    private fieldConfigs: FormFieldConfig[];

    private validityChangeCallback: ((valid: boolean) => void) | null = null;

    constructor(formId: string, fieldConfigs: FormFieldConfig[]) {
      this.formId = formId;
      this.fieldConfigs = fieldConfigs;
    }

    public initialize = () => {
      if (this.isInitialized) {
        console.warn(`Form id ${this.formId} already initialized.`);
        return;
      }

      const formElement = this.getFormElement();
      if (!formElement) {
        console.warn(`Form id ${this.formId} does not exist.`);
        return;
      }
      const formFieldElements = this.getFormFieldElements();
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
          this.fieldsValidity[fieldElementIndex] = this.fieldConfigs[
            fieldElementIndex
          ].validator
            ? this.fieldConfigs[fieldElementIndex].validator(value)
            : true; // no validator for field - always `true` (valid)

          this.updateFormValidState();
        };
        fieldElement.addEventListener("input", inputEventHandler);
        unsubscribeFunctions.push(() => {
          fieldElement.removeEventListener("input", inputEventHandler);
        });

        // First-run field validators
        this.fieldsValidity[fieldElementIndex] = this.fieldConfigs[
          fieldElementIndex
        ].validator
          ? this.fieldConfigs[fieldElementIndex].validator(fieldElement.value)
          : true; // no validator for field - always `true` (valid)
      });

      this.unsubscribeFieldInputListeners = () => {
        unsubscribeFunctions.forEach((fn) => {
          fn();
        });
      };
      this.isInitialized = true;

      // Return current initialized form validity state
      return this.getFormValidState();
    };

    public deinitialize = () => {
      if (this.isInitialized) {
        this.unsubscribeFieldInputListeners();
        this.validityChangeCallback = null;
        this.isInitialized = false;
      }
    };

    public getFormValidState = () =>
      this.fieldsValidity.length === 0
        ? true
        : this.fieldsValidity.findIndex(
            (fieldValidity) => fieldValidity === false
          ) === -1; // form not valid if >= 1 field validity == `false`

    public onValidityChange = (callback: ((valid: boolean) => void) | null) => {
      this.validityChangeCallback = callback;
    };

    public forceValidityUpdate = () => {
      const formFieldElements = this.getFormFieldElements();
      formFieldElements.forEach((fieldElement, fieldElementIndex) => {
        this.fieldsValidity[fieldElementIndex] = this.fieldConfigs[
          fieldElementIndex
        ].validator
          ? this.fieldConfigs[fieldElementIndex].validator(fieldElement.value)
          : true; // no validator for field - always `true` (valid)
      });

      this.updateFormValidState();
    };

    public getFormData = () => {
      const formElement = this.getFormElement();
      return formElement ? new FormData(formElement) : null;
    };

    private getFormElement = () =>
      document.querySelector<HTMLFormElement>(`form#${this.formId}`);
    private getFormFieldElements = () => {
      const formElement = this.getFormElement();
      return this.fieldConfigs.map((fieldConfig) =>
        formElement.querySelector<HTMLInputElement>(
          `input[name="${fieldConfig.name}"]`
        )
      );
    };

    private updateFormValidState = () => {
      // Handle Fields Validity
      const formFieldElements = this.getFormFieldElements();
      this.fieldsValidity.forEach((fieldValidity, index) => {
        const shouldTriggerFieldValidityChangeListener =
          this.lastFieldsValidity[index] !== fieldValidity;
        this.lastFieldsValidity[index] = fieldValidity;
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
        currentFormValidState !== this.lastFormValidState;
      this.lastFormValidState = currentFormValidState;
      if (
        shouldTriggerValidityChangeListener &&
        typeof this.validityChangeCallback === "function"
      ) {
        this.validityChangeCallback(currentFormValidState);
      }
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

  // Button
  class Button {
    public buttonId: string;
    private innerHTML: string;

    private showLoading = false;
    private canClick = true;

    /**
     * Constructor
     * @param {string} buttonId
     */
    constructor(buttonId) {
      this.buttonId = buttonId;

      const element = this.getElement();
      if (element) {
        this.innerHTML = element.innerHTML;
      }
    }

    setOnClick = (
      callback: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null
    ) => {
      const element = this.getElement();
      if (element) {
        element.onclick = typeof callback === "function" ? callback : undefined;
      }
    };

    setClickable = (canClick: boolean) => {
      this.canClick = canClick;
      this.updateClickableState();
    };

    setShowLoading = (showLoading: boolean) => {
      const element = this.getElement();
      if (!element) {
        return;
      }

      this.showLoading = showLoading;
      if (showLoading) {
        element.style.color = "transparent";
        element.innerHTML = `${this.innerHTML}<div class="button-spinner-wrapper">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>`;
      } else {
        element.innerHTML = this.innerHTML;
        element.style.color = "";
      }

      this.updateClickableState();
    };

    /**
     * Set button text.
     * @param {string} text Text content for button.
     * @param {boolean} [showRightChevron] show right chevron.
     */
    setText = (text: string, showRightChevron?: boolean) => {
      const element = this.getElement();
      if (!element) {
        return;
      }

      const formattedText = text.replace(" ", "&nbsp;"); // force white-space to be non-breaking
      element.innerHTML = formattedText;
      this.innerHTML = formattedText;
    };

    public getElement = () => document.getElementById(this.buttonId);
    private updateClickableState = () => {
      const element = this.getElement();
      if (!element) {
        return;
      }

      const clickable = this.canClick && !this.showLoading;
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
        element.style.color = this.showLoading ? "transparent" : "#79868e";
        element.style.boxShadow = "none";
      }
    };
  }

  // Countdown
  class Countdown {
    private seconds: number;

    interval = null;
    onTickCallback: ((secondsLeft: number) => void) | null = null;

    /**
     * Constructor
     * @param {number} seconds Initial seconds for countdown.
     */
    constructor(seconds: number) {
      this.setSeconds(seconds);
    }

    setSeconds = (seconds) => {
      this.seconds = Math.max(0, seconds || 0);
      this.clearTimer();
    };

    start = () => {
      let secondsLeft = this.seconds;
      if (secondsLeft > 0) {
        if (typeof this.onTickCallback === "function") {
          this.onTickCallback(secondsLeft);
        }
        this.interval = setInterval(() => {
          secondsLeft -= 1;

          if (typeof this.onTickCallback === "function") {
            this.onTickCallback(secondsLeft);
          }

          if (secondsLeft === 0) {
            this.clearTimer();
          }
        }, 1000);
      }
    };

    clearTimer = () => {
      if (typeof this.interval === "number") {
        clearInterval(this.interval);
      }
    };

    setOnTick = (callback: ((secondsLeft: number) => void) | null) => {
      this.onTickCallback = callback;
    };
  }

  // Declare configuration constants
  // -- Network
  const networkService = new NetworkService({
    baseUrl:
      location.hostname === "ratesapp.co.id"
        ? "https://ratesapp.co.id/rs/api"
        : "https://staging.ratesapp.co.id/rs/api", // staging
    headers: {
      "Accept-Language": "id-ID",
    },
  });
  const logout = () => {
    networkService.request("DELETE", "/users/sessions");
  };

  // -- Referral Code
  const REFERRAL_CODE_ID = "referral-code"; // main referral code element
  const REFERRAL_CODE_VALUE_ID = "referral-code-value";
  const setShowReferralCode = (show: boolean) => {
    const referralCodeElement = document.getElementById(REFERRAL_CODE_ID);
    if (referralCodeElement) {
      referralCodeElement.style.visibility = show ? "" : "hidden";
    }
  };

  // -- Section 1
  const SECTION_1_ID = "step-1";
  class Section1 extends Section {
    public onActive = () => {
      this.setupMainButton();
    };

    public onInactive = () => {
      this.teardownMainButton();
    };

    private setupMainButton = () => {
      mainButton.setText("Mulai");
      mainButton.setClickable(true);
      mainButton.setOnClick((event) => {
        event.preventDefault();
        sectionManager.goToSection(SECTION_2_ID);
      });
    };
    private teardownMainButton = () => {
      mainButton.setOnClick(null);
    };
  }
  const section1 = new Section1(SECTION_1_ID);

  // -- Section 2
  const SECTION_2_ID = "step-2";
  const PHONE_NUMBER_FORM_ID = "phone-form";
  const PHONE_NUMBER_INPUT_ID = "phone-input";
  const PHONE_NUMBER_INPUT_NAME = "phone";
  const PHONE_NUMBER_INVALID_MESSAGE_ID = "invalid-phone-error";
  class Section2 extends Section {
    private formPhoneInput = document.getElementById(
      PHONE_NUMBER_INPUT_ID
    ) as HTMLInputElement;
    private formPhoneInputIntlInstance = (window as any).intlTelInputGlobals.getInstance(
      this.formPhoneInput
    );
    private form = document.getElementById(
      PHONE_NUMBER_FORM_ID
    ) as HTMLFormElement;
    private formManager = new FormValidityManager(PHONE_NUMBER_FORM_ID, [
      {
        name: PHONE_NUMBER_INPUT_NAME,
        validator: (value) =>
          /^[+]?\d+$/.test(value) &&
          this.formPhoneInputIntlInstance.isValidNumber(),
      },
    ]);
    private formPhoneInputInvalidElement = document.getElementById(
      PHONE_NUMBER_INVALID_MESSAGE_ID
    );
    private isFormLoading = false;
    private isFormValid = false;

    public onActive = () => {
      this.setupForm();
      this.setupMainButton();
    };

    public onInactive = () => {
      this.teardownForm();
      this.teardownMainButton();
    };

    private setupMainButton = () => {
      mainButton.setText("Lanjut");
      mainButton.setOnClick((event) => {
        event.preventDefault();
        this.submitForm();
      });
    };
    private teardownMainButton = () => {
      mainButton.setOnClick(null);
    };

    private setupForm = () => {
      this.formPhoneInput?.addEventListener(
        "countrychange",
        this.handleFormPhoneInputCountryChange
      );
      this.formPhoneInput?.addEventListener(
        "input",
        this.handleFormPhoneInputChange
      );
      this.form.onsubmit = (event) => {
        event.preventDefault();
        this.submitForm();
      };
      this.formManager.onValidityChange(this.setIsFormValid);
      this.formManager.initialize();
      this.setIsFormValid(this.formManager.getFormValidState());
      hideInputFieldElementError(
        this.formPhoneInput,
        this.formPhoneInputInvalidElement
      );
    };
    private teardownForm = () => {
      this.formPhoneInput?.removeEventListener(
        "countrychange",
        this.handleFormPhoneInputCountryChange
      );
      this.formPhoneInput?.removeEventListener(
        "input",
        this.handleFormPhoneInputChange
      );
      this.form.onsubmit = undefined;
      this.formManager.onValidityChange(null);
      this.formManager.deinitialize();
    };

    private handleFormPhoneInputCountryChange = () => {
      hideInputFieldElementError(
        this.formPhoneInput,
        this.formPhoneInputInvalidElement
      );
      this.formManager.forceValidityUpdate(); // force-validate fields again on country change
    };
    private handleFormPhoneInputChange = () => {
      hideInputFieldElementError(
        this.formPhoneInput,
        this.formPhoneInputInvalidElement
      );
    };
    private setFormPhoneInputReadonly = (readonly: boolean) => {
      setInputFieldReadonly(this.formPhoneInput, readonly);
    };

    private submitForm = async () => {
      if (this.isFormLoading || !this.isFormValid) {
        return;
      }

      hideInputFieldElementError(
        this.formPhoneInput,
        this.formPhoneInputInvalidElement
      );
      this.setIsFormLoading(true);

      const e164PhoneNumber = this.formPhoneInputIntlInstance.getNumber();
      try {
        const {
          data: {
            data: { cooldownLeft },
          },
        } = await networkService.request<{
          message: string;
          data: { cooldownLeft: number };
        }>("POST", "/v2/users/sessions/otp/new", {
          data: {
            phoneNumber: e164PhoneNumber,
          },
        });

        // Set data variable values
        phoneNumber = e164PhoneNumber;
        otpResendCooldown = cooldownLeft;

        this.setIsFormLoading(false);
        sectionManager.goToSection(SECTION_3_ID);
      } catch (error) {
        let errorMessage = error?.data?.message;
        if (!errorMessage) {
          errorMessage =
            "Proses memuat halaman belum berhasil. Silakan coba lagi";
        }

        showInputFieldElementError(
          this.formPhoneInput,
          this.formPhoneInputInvalidElement,
          errorMessage
        );
        this.setIsFormLoading(false);
      }
    };

    // Handle state changes
    private setIsFormValid = (state: boolean) => {
      this.isFormValid = state;
      this.updateState();
    };
    private setIsFormLoading = (state: boolean) => {
      this.isFormLoading = state;
      this.updateState();
    };

    private updateState = () => {
      // Form Input
      const inputDisabled = this.isFormLoading;
      this.setFormPhoneInputReadonly(inputDisabled);

      // Main button
      const canSubmit = this.isFormValid && !this.isFormLoading;
      mainButton.setClickable(canSubmit);
      mainButton.setShowLoading(this.isFormLoading);
    };
  }
  const section2 = new Section2(SECTION_2_ID);

  // -- Section 3
  const SECTION_3_ID = "step-3";
  const OTP_PHONE_NUMBER_TEXT_ID = "otp-phone-number";
  const OTP_FORM_ID = "otp-form";
  const OTP_INPUT_ID = "otp-input";
  const OTP_INPUT_NAME = "otp";
  const OTP_INVALID_MESSAGE_ID = "invalid-otp-error";
  const OTP_COOLDOWN_BUTTON_ID = "otp-cooldown";
  const OTP_COOLDOWN_TIMER_TEXT_ID = "cooldown-timer";
  const CHANGE_PHONE_BUTTON_ID = "change-phone";
  class Section3 extends Section {
    private otpPhoneNumberText = document.getElementById(
      OTP_PHONE_NUMBER_TEXT_ID
    );
    private otpCountdown = new Countdown(0);
    private otpResendButton = document.getElementById(OTP_COOLDOWN_BUTTON_ID);
    private otpCooldownTimerText = document.getElementById(
      OTP_COOLDOWN_TIMER_TEXT_ID
    );
    private isOtpResending = false;
    private isOtpCooldown = false;
    private lastResendOtpButtonInactiveTime: number | null; // support variable to assist in cancellation of OTP resend request

    private changePhoneButton = document.getElementById(CHANGE_PHONE_BUTTON_ID);

    private form = document.getElementById(OTP_FORM_ID) as HTMLFormElement;
    private formOtpInput = document.getElementById(
      OTP_INPUT_ID
    ) as HTMLInputElement;
    private formManager = new FormValidityManager(OTP_FORM_ID, [
      {
        name: OTP_INPUT_NAME,
        validator: (value) => value && value.length === 6,
      },
    ]);
    private formOtpInputInvalidElement = document.getElementById(
      OTP_INVALID_MESSAGE_ID
    );
    private isFormLoading = false;
    private isFormValid = false;

    public onActive = () => {
      this.updateOtpPhoneNumber();
      this.setupOtpResendButton();
      this.setupChangePhoneButton();
      this.setupForm();
      this.setupMainButton();
    };

    public onInactive = () => {
      this.teardownOtpResendButton();
      this.teardownChangePhoneButton();
      this.teardownForm();
      this.teardownMainButton();
    };

    private updateOtpPhoneNumber = () => {
      if (this.otpPhoneNumberText) {
        this.otpPhoneNumberText.innerText = phoneNumber;
      }
    };

    // Resend OTP
    private setupOtpResendButton = () => {
      const cooldownSeconds = Math.max(0, otpResendCooldown);
      this.otpCountdown.setSeconds(cooldownSeconds);
      this.otpCountdown.setOnTick((secondsLeft) => {
        if (secondsLeft <= 0) {
          this.setOtpResendButtonDisplayCooldown(0);
          this.setIsOtpCooldown(false);
        } else {
          this.setOtpResendButtonDisplayCooldown(secondsLeft);
          this.setIsOtpCooldown(true);
        }
      });
      if (cooldownSeconds === 0) {
        this.setOtpResendButtonDisplayCooldown(cooldownSeconds);
        this.setIsOtpCooldown(false);
      } else {
        this.otpCountdown.start();
      }
      this.otpResendButton.onclick = (event) => {
        event.preventDefault();
        this.resendOtp();
      };
    };
    private teardownOtpResendButton = () => {
      otpResendCooldown = 0;
      this.setIsOtpCooldown(false);
      this.setIsOtpResending(false);
      this.otpCountdown.clearTimer();
      this.otpCountdown.setOnTick(null);
      this.otpResendButton.onclick = undefined;
      this.lastResendOtpButtonInactiveTime = Date.now();
    };
    private setOtpResendButtonDisplayCooldown = (cooldownSeconds: number) => {
      if (!this.otpCooldownTimerText) {
        return;
      }
      if (cooldownSeconds <= 0) {
        this.otpCooldownTimerText.innerText = "";
      } else {
        const minutes = Math.floor(cooldownSeconds / 60);
        const seconds = cooldownSeconds % 60;
        if (this.otpCooldownTimerText) {
          this.otpCooldownTimerText.innerText = ` ${minutes}:${
            seconds < 10 ? `0${seconds}` : seconds
          }`;
        }
      }
    };
    private setOtpResendButtonDisabled = (disabled: boolean) => {
      if (disabled) {
        if (this.otpResendButton) {
          this.otpResendButton.setAttribute("tabIndex", "-1");
          this.otpResendButton.style.pointerEvents = "none";
          this.otpResendButton.style.cursor = "default";
          this.otpResendButton.style.color = "";
        }
      } else {
        if (this.otpResendButton) {
          this.otpResendButton.setAttribute("tabIndex", "0");
          this.otpResendButton.style.pointerEvents = "";
          this.otpResendButton.style.cursor = "";
          this.otpResendButton.style.color = "#f26e64";
        }
      }
    };

    private resendOtp = async () => {
      if (this.isOtpResending || this.isOtpCooldown || this.isFormLoading) {
        return; // do nothing
      }

      this.setIsOtpResending(true);

      const requestTime = Date.now();

      let cooldownSeconds;
      let errorMessage;
      try {
        const {
          data: {
            data: { cooldownLeft },
          },
        } = await networkService.request<{
          message: string;
          data: { cooldownLeft: number };
        }>("POST", "/v2/users/sessions/otp/new", {
          data: {
            phoneNumber: phoneNumber,
          },
        });
        cooldownSeconds = cooldownLeft;
      } catch (error) {
        errorMessage = error?.data?.message;
        if (!errorMessage) {
          errorMessage =
            "Proses memuat halaman belum berhasil. Silakan coba lagi";
        }
      }

      // Abandon request fulfilment if button unmounts after request is initiated
      if (
        this.lastResendOtpButtonInactiveTime !== null &&
        this.lastResendOtpButtonInactiveTime > requestTime
      ) {
        return;
      }

      this.setIsOtpResending(false);

      if (cooldownSeconds !== undefined) {
        this.otpCountdown.setSeconds(cooldownSeconds);
        this.otpCountdown.start();
      } else {
        window.alert(errorMessage);
      }
    };

    private setupChangePhoneButton = () => {
      this.changePhoneButton.onclick = (event) => {
        event.preventDefault();
        sectionManager.goToSection(SECTION_2_ID);
      };
    };
    private teardownChangePhoneButton = () => {
      this.changePhoneButton.onclick = undefined;
    };
    private setChangePhoneButtonDisabled = (disabled: boolean) => {
      if (disabled) {
        if (this.changePhoneButton) {
          this.changePhoneButton.setAttribute("tabIndex", "-1");
          this.changePhoneButton.style.pointerEvents = "none";
          this.changePhoneButton.style.cursor = "default";
        }
      } else {
        if (this.changePhoneButton) {
          this.changePhoneButton.setAttribute("tabIndex", "0");
          this.changePhoneButton.style.pointerEvents = "";
          this.changePhoneButton.style.cursor = "";
        }
      }
    };

    private setupMainButton = () => {
      mainButton.setText("Lanjut");
      mainButton.setOnClick((event) => {
        event.preventDefault();
        this.submitForm();
      });
    };
    private teardownMainButton = () => {
      mainButton.setOnClick(null);
    };

    private setupForm = () => {
      this.formOtpInput?.addEventListener(
        "input",
        this.handleFormOtpInputChange
      );
      this.form.onsubmit = (event) => {
        event.preventDefault();
        this.submitForm();
      };
      this.formManager.onValidityChange(this.setIsFormValid);
      this.formManager.initialize();
      this.setIsFormValid(this.formManager.getFormValidState());
      hideInputFieldElementError(
        this.formOtpInput,
        this.formOtpInputInvalidElement
      );
    };
    private teardownForm = () => {
      this.formOtpInput?.removeEventListener(
        "input",
        this.handleFormOtpInputChange
      );
      this.form.onsubmit = undefined;
      this.formManager.onValidityChange(null);
      this.formManager.deinitialize();
      this.setIsFormValid(this.formManager.getFormValidState());
    };

    private handleFormOtpInputChange = () => {
      hideInputFieldElementError(
        this.formOtpInput,
        this.formOtpInputInvalidElement
      );
    };
    private setFormOtpInputReadonly = (readonly: boolean) => {
      setInputFieldReadonly(this.formOtpInput, readonly);
    };

    private submitForm = async () => {
      if (this.isFormLoading || !this.isFormValid) {
        return;
      }

      hideInputFieldElementError(
        this.formOtpInput,
        this.formOtpInputInvalidElement
      );
      this.setIsFormLoading(true);

      const otpFormData = this.formManager.getFormData();
      const otp = otpFormData?.get(OTP_INPUT_NAME);

      let userToken;
      let errorMessage;
      try {
        const {
          data: {
            data: { _token },
          },
        } = await networkService.request<{
          data: { _token };
        }>("POST", "/v2/users/sessions/otp/auth", {
          data: {
            phoneNumber: phoneNumber,
            otp,
          },
        });
        userToken = _token;
      } catch (error) {
        errorMessage = error?.data?.message;
        if (!errorMessage) {
          errorMessage =
            "Proses memuat halaman belum berhasil. Silakan coba lagi";
        }
      }

      if (userToken) {
        // OTP success
        networkService.setHeaders({
          Authorization: `Bearer ${userToken}`,
        });

        // Attempt to automatically apply referral code
        try {
          await networkService.request(
            "POST",
            "/v2/users/me/use-referral-code",
            { data: { code: referralCode } }
          );

          logout();

          // Go to signup success page
          location.assign("/signup-success");
          return; // exit here to retain form processing state while navigating to next page
        } catch (error) {
          this.setIsFormLoading(false);

          const errorStatus = (error as NetworkRequestError)?.status;
          const errorData = (error as NetworkRequestError)?.data;

          if (errorStatus === 422) {
            const serverErrorCode = (errorData as any)?.data?.code;
            if (serverErrorCode === 1533) {
              // Already used referral code
              logout();
              sectionManager.goToSection(SECTION_4A_ID);
              return;
            }
          }

          // Default handling - go to manual referral entry
          sectionManager.goToSection(SECTION_4_ID);
        }
      } else {
        // OTP failure
        showInputFieldElementError(
          this.formOtpInput,
          this.formOtpInputInvalidElement,
          errorMessage
        );
      }

      this.setIsFormLoading(false);
    };

    // Handle state changes
    private setIsOtpCooldown = (state: boolean) => {
      this.isOtpCooldown = state;
      this.updateState();
    };
    private setIsOtpResending = (state: boolean) => {
      this.isOtpResending = state;
      this.updateState();
    };
    private setIsFormValid = (state: boolean) => {
      this.isFormValid = state;
      this.updateState();
    };
    private setIsFormLoading = (state: boolean) => {
      this.isFormLoading = state;
      this.updateState();
    };
    private updateState = () => {
      // Back button
      const backDisabled = this.isFormLoading;
      this.setChangePhoneButtonDisabled(backDisabled);

      // Form Input
      const inputDisabled = this.isFormLoading;
      this.setFormOtpInputReadonly(inputDisabled);

      // Resend button
      const canResendOtp =
        !this.isOtpCooldown && !this.isOtpResending && !this.isFormLoading;
      this.setOtpResendButtonDisabled(!canResendOtp);

      // Main button
      const canSubmit = this.isFormValid && !this.isFormLoading;
      mainButton.setClickable(canSubmit);
      mainButton.setShowLoading(this.isFormLoading);
    };
  }
  const section3 = new Section3(SECTION_3_ID);

  // -- Section 4
  const SECTION_4_ID = "step-4";
  const REFERRAL_FORM_ID = "referral-form";
  const REFERRAL_INPUT_ID = "referral-input";
  const REFERRAL_INPUT_NAME = "referral";
  const REFERRAL_INVALID_MESSAGE_ID = "invalid-referral-error";
  class Section4 extends Section {
    private form = document.getElementById(REFERRAL_FORM_ID) as HTMLFormElement;
    private formReferralInput = document.getElementById(
      REFERRAL_INPUT_ID
    ) as HTMLInputElement;
    private formManager = new FormValidityManager(REFERRAL_FORM_ID, [
      {
        name: REFERRAL_INPUT_NAME,
        validator: (value) => !!value && value.length > 0,
      },
    ]);
    private formReferralInputInvalidElement = document.getElementById(
      REFERRAL_INVALID_MESSAGE_ID
    );
    private isFormLoading = false;
    private isFormValid = false;

    public onActive = () => {
      setShowReferralCode(false); // hide referral code display
      this.setupForm();
      this.setupMainButton();
    };

    public onInactive = () => {
      this.teardownForm();
      this.teardownMainButton();
    };

    private setupMainButton = () => {
      mainButton.setText("Lanjut");
      mainButton.setOnClick((event) => {
        event.preventDefault();
        this.submitForm();
      });
    };
    private teardownMainButton = () => {
      mainButton.setOnClick(null);
    };

    private setupForm = () => {
      this.formReferralInput?.addEventListener(
        "input",
        this.handleFormReferralInputChange
      );
      this.form.onsubmit = (event) => {
        event.preventDefault();
        this.submitForm();
      };
      this.formManager.onValidityChange(this.setIsFormValid);
      this.formManager.initialize();
      this.setIsFormValid(this.formManager.getFormValidState());
      hideInputFieldElementError(
        this.formReferralInput,
        this.formReferralInputInvalidElement
      );
    };
    private teardownForm = () => {
      this.formReferralInput?.removeEventListener(
        "input",
        this.handleFormReferralInputChange
      );
      this.form.onsubmit = undefined;
      this.formManager.onValidityChange(null);
      this.formManager.deinitialize();
    };

    private handleFormReferralInputChange = () => {
      hideInputFieldElementError(
        this.formReferralInput,
        this.formReferralInputInvalidElement
      );
    };
    private setFormReferralInputReadonly = (readonly: boolean) => {
      setInputFieldReadonly(this.formReferralInput, readonly);
    };

    private submitForm = async () => {
      if (this.isFormLoading || !this.isFormValid) {
        return;
      }

      hideInputFieldElementError(
        this.formReferralInput,
        this.formReferralInputInvalidElement
      );
      this.setIsFormLoading(true);

      const referralFormData = this.formManager.getFormData();
      const code = referralFormData?.get(REFERRAL_INPUT_NAME);

      try {
        await networkService.request("POST", "/v2/users/me/use-referral-code", {
          data: {
            code,
          },
        });

        logout();

        // Go to signup success page
        location.assign("/signup-success");
        return; // exit here to retain form processing state while navigating to next page
      } catch (error) {
        this.setIsFormLoading(false);

        const errorStatus = (error as NetworkRequestError)?.status;
        const errorData = (error as NetworkRequestError)?.data;

        if (errorStatus === 422) {
          const serverErrorCode = (errorData as any)?.data?.code;
          if (serverErrorCode === 1533) {
            // Already used referral code
            logout();
            sectionManager.goToSection(SECTION_4A_ID);
            return;
          }
        }

        let errorMessage = (errorData as any)?.message;
        if (!errorMessage) {
          errorMessage =
            "Proses memuat halaman belum berhasil. Silakan coba lagi";
        }

        showInputFieldElementError(
          this.formReferralInput,
          this.formReferralInputInvalidElement,
          errorMessage
        );
      }
    };

    // Handle state changes
    private setIsFormValid = (state: boolean) => {
      this.isFormValid = state;
      this.updateState();
    };
    private setIsFormLoading = (state: boolean) => {
      this.isFormLoading = state;
      this.updateState();
    };
    private updateState = () => {
      // Form Input
      const inputDisabled = this.isFormLoading;
      this.setFormReferralInputReadonly(inputDisabled);

      // Main button
      const canSubmit = this.isFormValid && !this.isFormLoading;
      mainButton.setClickable(canSubmit);
      mainButton.setShowLoading(this.isFormLoading);
    };
  }
  const section4 = new Section4(SECTION_4_ID);

  // -- Section 4a
  const SECTION_4A_ID = "step-4a";
  class Section4a extends Section {
    public onActive = () => {
      setShowReferralCode(false); // hide referral code display
      this.setupMainButton();
    };

    public onInactive = () => {
      this.teardownMainButton();
    };

    private setupMainButton = () => {
      mainButton.setText("Unduh RateS");
      mainButton.setClickable(true);
      mainButton.setOnClick(null);
      const mainButtonElement = mainButton.getElement();
      if (mainButtonElement) {
        mainButtonElement.setAttribute(
          "href",
          "https://ratesapp.app.link/Website-N5I8"
        );
        mainButtonElement.setAttribute("target", "_blank");
      }
    };
    private teardownMainButton = () => {
      const mainButtonElement = mainButton.getElement();
      if (mainButtonElement) {
        mainButtonElement.setAttribute("href", "");
        mainButtonElement.removeAttribute("target");
      }
    };
  }
  const section4a = new Section4a(SECTION_4A_ID);

  // -- Main button
  const MAIN_BUTTON_ID = "next-button";
  const mainButton = new Button(MAIN_BUTTON_ID);

  // Data variables
  const referralCode = getURLSearchParams().get("referral_code");
  let phoneNumber = "";
  let otpResendCooldown = 0;

  // Initialize
  const referralCodeElement = document.getElementById(REFERRAL_CODE_VALUE_ID);
  if (referralCodeElement) {
    referralCodeElement.innerText = referralCode;
    referralCodeElement.style.opacity = "1";
  }

  const sectionManager = new SectionManager([
    section1,
    section2,
    section3,
    section4,
    section4a,
  ]);
  sectionManager.goToSection(0);

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

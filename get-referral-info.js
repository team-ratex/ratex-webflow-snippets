// At the start of the page, we will have removed the previous referral code 

class ReferralCodeHandler {
  constructor() {
    this.url = 'https://ratex.co/api/users/referral?referral_code=';
    this.message = null;
    this.code = null
    this.setupPage();
    this.titleId = $('#main-top-level-title')[0];
    this.mobileTitleId = $('#main-mobile-top-level-title')[0];
    this.titleDesc = $('#main-top-level-desc')[0];
  }
  setupPage() {
    const referralCode = this.getReferralCodeFromPage();
    this.getNameFromReferralCode(referralCode);
  }
  // Does an API call to get the name of the user based on the referral code.
  getNameFromReferralCode(code) {
    $.get(`${this.url}${code}`)
      .then((response) => {
        if (response && response.data) {
          this.message = response.data.message;
          this.renderWebsiteCopy();
        }
      });
  }
  getReferralCodeFromPage() {
    const getParamKey = 'referral';
    const currentURL = window.location;
    const url = new URL(currentURL);
    const code = url.searchParams.get(getParamKey);
    this.code = code;
    return code;
  }
  renderWebsiteCopy() {
    if (this.message) {
      // Desktop
      if (this.titleId) {
        // Update Title
        this.titleId.innerText = this.message;
      }
      if (this.mobileTitleId) {
        // Update Title
        this.mobileTitleId.innerText = this.message;
        // Add additional information regarding what code to use
        const paragraph = document.createElement("p");
        paragraph.style.color = '#333';
        paragraph.innerHTML = `
          Use code 
          <span style="padding: 2px 4px; color: #3A3A3A; background: #FAFAFC; font-weight: 600; border-radius: 5px; font-size: 85%;">${this.code}</span> 
          when signing up for your account on RateX
        `;
        this.mobileTitleId.after(paragraph);
      }
    }
  }
}

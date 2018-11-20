class ReferralCodeHandler {
  constructor() {
    this.url = 'https://ratex.co/api/users/referral?referral_code=';
    this.name = null;
    this.setupPage();
    this.titleId = $('#main-top-level-title')[0];
    this.titleDesc = $('#main-top-level-desc')[0];
  }
  setupPage() {
    const referralCode = this.getReferralCodeFromPage();
    this.getNameFromReferralCode(referralCode);
  }
  getNameFromReferralCode(code) {
    $.get(`${this.url}${code}`)
      .then((response) => {
        if (response && response.data) {
          this.name = response.data.name;
          this.renderWebsiteCopy();
        }
      });
  }
  getReferralCodeFromPage() {
    const getParamKey = 'referral';
    const currentURL = window.location;
    const url = new URL(currentURL);
    const code = url.searchParams.get(getParamKey);
    return code;
  }
  renderWebsiteCopy() {
    if (this.name) {
      this.titleId.innerHTML = `${this.name} wants you to stop searching for coupon codes`;
    }
  }
}

const StartWatchingIndeedButton = (target) => {
  // Mutation function
  const ChangeIndeedButtonFunc = () => {
    // Add our own class in
    $('.indeed-apply-widget').addClass('apply-careers');

    // Remove background color and shadow
    $('.indeed-apply-button').attr('style', 'background: none !important; box-shadow: none !important');

    // Remove indeed logo
    $('.indeed-apply-button .indeed-apply-button-inner-left').attr('style', 'display: none !important');

    // Edit internal button
    $('.indeed-apply-button .indeed-apply-button-inner').attr(
      'style',
      'background: unset !important;'
      + 'color: #203542 !important;'
      + 'padding: 0px !important;'
      + 'font: unset !important;'
      + 'text-shadow: none !important;'
      + 'display: flex !important;'
      + 'align-items: center !important',
    );
  };

  // create an observer instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      setTimeout(ChangeIndeedButtonFunc, 100);
    });
  });

  // configuration of the observer:
  const config = { attributes: true, childList: true, characterData: true }

  // pass in the target node, as well as the observer options
  observer.observe(target, config);
};

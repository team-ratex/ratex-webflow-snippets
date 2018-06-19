const StartWatchingIndeedButton = (target) => {
  // Mutation function
  const ChangeIndeedButtonFunc = () => {
    // Add our own class in
    $('.indeed-apply-widget').addClass('apply-careers');
    // $('.apply-careers').attr('style', 'background: none !important; box-shadow: none !important');

    // Remove background color and shadow
    $('.indeed-apply-button').attr(
      'style',
      'background: none !important;'
      + 'box-shadow: none !important;'
      + 'padding: 5px 20px !important;'
      + 'display: inline-block;',
    );

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
      + 'float: none !important;'
      + 'align-items: center !important',
    );
  };

  if ($('.indeed-apply-button .indeed-apply-button-inner-left').length > 0) {
    ChangeIndeedButtonFunc();
  } 

  // create an observer instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      setTimeout(ChangeIndeedButtonFunc, 0);
    });
  });

  // configuration of the observer:
  const config = { attributes: true, childList: true, characterData: true }

  // pass in the target node, as well as the observer options
  observer.observe(target, config);
};

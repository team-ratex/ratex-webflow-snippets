// Function to help do search
/**
 * onSearch - Iterate through all deals and remove items that does not have queryString  
 *
 * @param  {String} queryString queryString to do search on
 * @return {func}               hides/show elements depending whether it contains the queryString   
 */
 const onSearch = (queryString) => {
  // Create nothing found element first (in case we need to use it)
  const queryStringEle = $('<span/>')
                          .css('color','#1f3541')
                          .text('"' + queryString + '"');
                          
  const nothingFoundEle = $('<h2/>')
                          .attr('id', 'nothing-found')
                          .css({
                            'color': '#8f9aa0',
                            'text-align': 'center',
                            'width': '100%',
                          })
                          .text("No results for ")
                          .append(queryStringEle);
 
  const totalItemsCount = $('.shop > .deals').length; // To track number of items hidden
  let itemsHidden = 0;
  $('.shop > .deals').each(function(idx, item) {
    // Handle empty string
    if (queryString.length === 0) {
      // Make everything in array show.
      $(item).show('300');
    } else {
      var currentItemName = ($(item)).find('.product-name').html().toLowerCase();
      // Check if queryString is inside
      if (currentItemName.indexOf(queryString.toLowerCase()) >= 0) {
        // show item
        $(item).show('300');
      } else {
        // Name does not match
        $(item).hide('300');
        itemsHidden += 1;
      }
    }
  });
  // After running through the list, check amount hidden.
  $('#nothing-found').remove(); // Remove old one
  if (itemsHidden === totalItemsCount) {
    // All is hidden - Show some message to indicate to user.
    $('.shop').append(nothingFoundEle);
  }
}

// Source : https://stackoverflow.com/questions/14042193/how-to-trigger-an-event-in-input-text-after-i-stop-typing-writing
// $('#element').donetyping(callback[, timeout=1000])
// Fires callback when a user has finished typing. This is determined by the time elapsed
// since the last keystroke and timeout parameter or the blur event--whichever comes first.
//   @callback: function to be called when even triggers
//   @timeout:  (default=1000) timeout, in ms, to to wait before triggering event if not
//              caused by blur.
//
(function($){
    $.fn.extend({
        donetyping: function(callback,timeout){
            timeout = timeout || 250; // 1 second default timeout
            var timeoutReference,
                doneTyping = function(el){
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function(i,el){
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress paste',function(e){
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too preemptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type=='keyup' && e.keyCode!=8) return;
                    
                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function(){
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur',function(){
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });
})(jQuery);

// Usage: 
$('#searchbar').donetyping(() => {
  let searchQuery = $('#searchbar').val();
  onSearch(searchQuery);
});
/**
 * Logic to add <timeago> to each deal
*/
/**
 * parseWebflowDateToISO - Helper function to parse date from webflow format to ISO format
 *  
 * @param  {string} timestamp Time in webflow format
 * @return {string}           Time is ISO format
 */ 
function parseWebflowDateToISO(timestamp) {
  // Parse the date
  const date = timestamp.split(' ')[0] + ' ' + timestamp.split(' ')[1] + ' ' + timestamp.split(' ')[2];
  const dateObject = new Date(date);
  const time = timestamp.split(' ')[3];
  const hours = parseInt(time.split(':')[0]);
  const minutes = parseInt(time.split(':')[1]);
  if (timestamp.split(' ')[4].toLowerCase() === 'pm' && hours < 12) {
    // Special calculations for hour. Format: "7:51am"
    dateObject.setHours(hours+12, minutes);
  } else {
    dateObject.setHours(hours, minutes);
  }
  return dateObject.toISOString();
}
/**
 * Logic to change timestamp to timeago
 * Reliant on library: http://timeago.yarp.com/
 */
// Change logic to open deal in new tab instead of modal opening for all deals on page.
$(function() {
  let iterableDeals = '.shop > .deals';
  if ($('.slick-track').length > 0) {
    iterableDeals = '.slick-track > .deals';
  }
  $(iterableDeals).each(function(idx, item) {
    const timestampClassName = 'div.date-of-post';
    // Grab the timestamp in webflow format
    const timestamp = $(item).find(timestampClassName).html();
    if (timestamp) {
      const timestampInISO = parseWebflowDateToISO(timestamp);

      // Create new time tag for jQuery timeago 
      const timeTag = $('<time/>')
        .attr('datetime', timestamp)
        .attr('class', 'timeago')
      // Append it in
      $(item).find('.posted-by-who').append('<span> </span>');
      $(item).find('.posted-by-who').append(timeTag);
    }
  });
  // On finish, wait for 1s before invoking timeago function
  setTimeout(function() {
    jQuery("time.timeago").timeago();
  }, 1000);
})

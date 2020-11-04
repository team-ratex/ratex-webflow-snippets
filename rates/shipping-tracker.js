class ShippingTracker {
  constructor() {
    // Constants
    this.steppersDom = {
      processing: {
        inactive: '#item-processing-inactive',
        active: '#item-processing-active',
      },
      shipped: {
        inactive: '#item-shipped-inactive',
        active: '#item-shipped-active',
      },
      reachedWarehouse: {
        inactive: '#item-reached-warehouse-inactive',
        active: '#item-reached-warehouse-active',
      },
      delivering: {
        inactive: '#item-delivering-inactive',
        active: '#item-delivering-active',
      },
      delivered: {
        inactive: '#item-delivered-inactive',
        active: '#item-delivered-active',
      },
      cancelled: {
        active: '#item-cancelled-active',
        inactive: '',
      },
      returned: {
        active: '#item-returned-active',
        inactive: '',
      }
    }
    this.statusStringMapper = {
      1: "Sedang Diproses", // "Processing",  || OrderItemStatusPendingGoodsOrder
      2: "Sedang Diproses", // "Processing",  || OrderItemStatusPendingFirstMile
      3: "Sedang Diproses", // "Processing",  || OrderItemStatusFirstMile
      4: "Sedang Diproses", // "Processing",  || OrderItemStatusOverseasWarehouseReceived
      5: "Dikirim", // "Shipped" || OrderItemStatusFreightForwarding
      6: "Pesanan tiba di gudang", // "Reached warehouse",  || OrderItemStatusLocalWarehouseReceived
      7: "Pesanan dikirim", // "Delivering",  || OrderItemStatusDelivering
      8: "Pesanan selesai", // "Delivered",  || OrderItemStatusDelivered
      9: "Dibatalkan", // "Cancelled", , || OrderItemStatusCancelled
      10: "Pesanan selesai", // "Delivered",  || OrderItemStatusPartiallyReturned
      11: "Pesanan selesai"// "Delivered" || OrderItemStatusReturned
    }
    this.itemId = this.getUrlParameter('i');
    this.debugMode = this.getUrlParameter('debug');
    var isStaging = location.host === 'rates-reseller.webflow.io'
    this.url = `https://${isStaging ? 'staging.' : ''}ratesapp.co.id/rs/api/v2/tracking?i=${this.itemId}`; // prod
    this.fetchData(); // API Call
  }
  // Phase 1: Processing
  toggleItemProcessingActive = () => {
    $(this.steppersDom.processing.inactive).css('display', 'none');
    $(this.steppersDom.processing.active).css('display', 'flex');
  }
  // Phase 2: Item Shipped
  toggleItemShippedActive = () => {
    $(this.steppersDom.shipped.inactive).css('display', 'none');
    $(this.steppersDom.shipped.active).css('display', 'flex');
  }
  // Phase 3: Item Reached Warehouse
  toggleItemReachedWarehouseActive = () => {
    $(this.steppersDom.reachedWarehouse.inactive).css('display', 'none');
    $(this.steppersDom.reachedWarehouse.active).css('display', 'flex');
  }
  // Phase 4: Item Delivering (We may have external tracking info here)
  toggleItemDeliveringActive = () => {
    $(this.steppersDom.delivering.inactive).css('display', 'none');
    $(this.steppersDom.delivering.active).css('display', 'flex');
  }
  // Phase 5: Item Delivered
  toggleItemDeliveredActive = () => {
    $(this.steppersDom.delivered.inactive).css('display', 'none');
    $(this.steppersDom.delivered.active).css('display', 'flex');
  }

  /* Additional Phases */
  // Cancelled
  handleItemCancelledEvent = () => {
    // Hide everything
    Object.keys(this.steppersDom).forEach((key) => {
      $(this.steppersDom[key].active).css('display', 'none');
      $(this.steppersDom[key].inactive).css('display', 'none');
    })
    // Show item cancelled stepper
    $(this.steppersDom.cancelled.active).css('display', 'flex');
  }
  // Returned
  toggleItemIsReturned = () => {
    $(this.steppersDom.returned.active).css('display', 'flex');
  }

  // Status Box Modifier
  updateStatusBox = (status, collectionMethod, collectionAmount, awbMinDuration, awbMaxDuration, deliveryMinDuration, deliveryMaxDuration, orderId, orderedAt) => {    
    const statusString = this.statusStringMapper[status];
    $('#item-status').html(statusString)
    const orderAndItemId = `#${orderId}`;
    $('#item-ID').html(`#${orderId}`);
    $('#Copy-Button').css('display', 'flex');
    $('#Copy-Button').click(() => {
      // Active state
      $('#Copy-Button').text('TERSALIN');
      this.writeText(orderAndItemId);
      setTimeout(() => {
        // Reset
        $('#Copy-Button').text('SALIN');
      }, 2000);
    });

    // Update tracking dates
    // AWB Estimate Wrapper and Lastmile Estimate Wrapper is hidden by default
    // If there is delivery min/max duration, show and populate the Lastmile Estimate Wrapper field
    if (deliveryMinDuration && deliveryMaxDuration) {
      $('#Lastmile-Estimate-Wrapper').css('display', 'block');
      const lastMileMinDate = new Date(orderedAt);
      lastMileMinDate.setDate(lastMileMinDate.getDate() + deliveryMinDuration);
      const lastMileMaxDate = new Date(orderedAt);
      lastMileMaxDate.setDate(lastMileMaxDate.getDate() + deliveryMaxDuration);
      // Show delayed text instead if current time is greater than last mile max date
      if (Date.now() > Date.parse(lastMileMaxDate)) {
        $('#Lastmile-Estimate').html(`Maaf, pengiriman anda tertunda`);
      }
      else {
        $('#Lastmile-Estimate').html(`${lastMileMinDate.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: "numeric"})} - ${lastMileMaxDate.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: "numeric"})}`);
      } 
    }
    else {
      // If there is awb min/max duration, show and populate the AWB Estimate Wrapper field
      if (awbMinDuration && awbMaxDuration) {
        $('#AWB-Estimate-Wrapper').css('display', 'block');
        const awbMinDate = new Date(orderedAt);
        awbMinDate.setDate(awbMinDate.getDate() + awbMinDuration);
        const awbMaxDate = new Date(orderedAt);
        awbMaxDate.setDate(awbMaxDate.getDate() + awbMaxDuration);
        // Show delayed text instead if current time is greater than awb max date
        if (Date.now() > Date.parse(awbMaxDate)) {
          $('#AWB-Estimate').html(`Maaf, pengiriman anda tertunda`);
        }
        else {
          $('#AWB-Estimate').html(`${awbMinDate.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: "numeric"})} - ${awbMaxDate.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: "numeric"})}`);
        }
      }
      // Else show/do nothing
    }
    
    if (collectionMethod === 'COD') {
      // Update payment-method
      $('#Payment-Method').html('Cash on Delivery');
      // update collection amount
      $('#Amount-to-pay-header').css('display', 'flex');
      $('#Amount-To-Pay').css('display', 'flex');
      $('#Amount-To-Pay').html(this.convertToRupiah(collectionAmount));
    } else {
      $('#Payment-Method').html('Pembayaran Online');
    }
  }
  updateShippingInfo = (courier, trackingRef, url) => {
    $('#Courier-Details').css('display', 'block');
    $('#courier').html(courier);
    $('#Courier-url').html(url);
    $('#Courier-url').attr("href", url);
    $('#Tracking-ID').html(trackingRef);
    // todo change the id below
    $('#Copy-Button-2').click(() => {
      // Active state
      $('#Copy-Button-2').text('TERSALIN');
      this.writeText(trackingRef);
      setTimeout(() => {
        // Reset
        $('#Copy-Button-2').text('SALIN');
      }, 2000);
    });
  }

  fetchData = () => {
    // Do api call
    $.ajax({
      url: this.url,
      // data: { signature: authHeader },
      type: "GET",
      beforeSend: function (xhr) { xhr.setRequestHeader('Accept-Language', 'id-ID'); },
      success: (response) => {
        // Grab values
        const {
          status,
          courier,
          trackingRef,
          url,
          collectionAmount,
          collectionMethod,
          awbMinDuration,
          awbMaxDuration,
          deliveryMinDuration,
          deliveryMaxDuration,
          orderId,
          orderedAt,
        } = response.data;
        
        // Update status box
        this.updateStatusBox(status, collectionMethod, collectionAmount, awbMinDuration, awbMaxDuration, deliveryMinDuration, deliveryMaxDuration, orderId, orderedAt);
        // Update tracking info if available
        if (trackingRef && (trackingRef.length > 0) && url && (url.length > 0)) {
          this.updateShippingInfo(courier, trackingRef, url);
        }
        // Do status toggling logic. Basically the larger numbers will switch all of the prior ones on
        switch (status) {
          // Special case: Cancelled. Only 1 that will break. We will remove all the steppers
          case 9:
            this.handleItemCancelledEvent();
            break;
          case 11:
          case 10:
            this.toggleItemIsReturned();
          case 8: // Delivered
            this.toggleItemDeliveredActive();
          case 7: // Last mile
            this.toggleItemDeliveringActive();
          case 6: // Local warehouse
            this.toggleItemReachedWarehouseActive();
          case 5: // Freight Forwarding
          case 4: // Overseas Warehouse
          case 3: // 1st mile in-procress
            this.toggleItemShippedActive();
          case 2: // Pending 1st mile
          case 1: // Pending order
            this.toggleItemProcessingActive();
        }
      },
      error: (error) => {
        // We swallow the errors, and display not found error
        $('.tracking-main-body').css('display', 'none') // hide tracking stuff
        $('#error-message').css('display', 'flex'); // show error div
        if (this.debugMode) {
          if (error.responseJSON) {
            alert(error.responseJSON.message);
          } else {
            alert(error.responseText)
          }
        }
      }
    });
  }
  // Helpers. GetUrlParameters is not supported in some non-modern browsers
  getUrlParameter = (key) => {
    var params = {};
    var parser = document.createElement('a');
    parser.href = window.location;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params[key];
  }
  // Helpers. convert to rupiah
  convertToRupiah = (x) => {
    const tempNum = String(x)
      .split('')
      .reverse();

    for (let i = 0; i < tempNum.length; i++) {
      if ((i + 1) % 3 === 0 && i !== tempNum.length - 1) {
        tempNum[i] = `.${tempNum[i]}`;
      }
    }
    return `Rp&nbsp${tempNum.reverse().join('')}`;
  };
  // Helpers. Copy to clipboard
  writeText = (str) => {
    return new Promise(function (resolve, reject) {

      /********************************/
      var range = document.createRange();
      range.selectNodeContents(document.body);
      document.getSelection().addRange(range);
      /********************************/

      var success = false;
      function listener(e) {
        e.clipboardData.setData("text/plain", str);
        e.preventDefault();
        success = true;
      }
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);

      /********************************/
      document.getSelection().removeAllRanges();
      /********************************/

      success ? resolve() : reject();
    });
  };
}

// Class runner
new ShippingTracker();
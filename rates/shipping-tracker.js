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
    this.url = `https://ratesapp.co.id/rs/api/tracking?i=${this.itemId}`; // prod
    // this.url = `https://staging.ratesapp.co.id/rs/api/tracking?i=${this.itemId}`; // staging
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
  updateStatusBox = (status, collectionMethod, collectionAmount, minDuration, maxDuration) => {
    const statusString = this.statusStringMapper[status];
    $('#item-status').html(statusString)
    $('#item-ID').html(this.itemId)
    $('#item-duration').html(`Terima dalam ${minDuration}-${maxDuration} hari`)
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
    $('#courier').html(courier);
    $('#Courier-url').html(url);
    $('#Courier-url').attr("href", url);
    $('#Tracking-ID').html(trackingRef);
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
          minDuration,
          maxDuration,
        } = response.data
        // Update status box
        this.updateStatusBox(status, collectionMethod, collectionAmount, minDuration, maxDuration);
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
          case 8:
            this.toggleItemDeliveredActive();
          case 7:
            this.toggleItemDeliveringActive();
          case 6:
          case 5:
          case 4:
            this.toggleItemReachedWarehouseActive();
          case 3:
            this.toggleItemShippedActive();
          case 2:
          case 1:
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
    /*
     * use \u00A0 (&nbsp) instead of space to ensure that it does not break strangely
     * For example Rp 1.000.000 becomes
     * Rp
     * 1.000.000
     */
    return `Rp\u00A0${tempNum.reverse().join('')}`;
  };
}

// Class runner
new ShippingTracker();
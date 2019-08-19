"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ShippingTracker = function ShippingTracker() {
  var _this = this;

  _classCallCheck(this, ShippingTracker);

  _defineProperty(this, "toggleItemProcessingActive", function () {
    $(_this.steppersDom.processing.inactive).css('display', 'none');
    $(_this.steppersDom.processing.active).css('display', 'flex');
  });

  _defineProperty(this, "toggleItemShippedActive", function () {
    $(_this.steppersDom.shipped.inactive).css('display', 'none');
    $(_this.steppersDom.shipped.active).css('display', 'flex');
  });

  _defineProperty(this, "toggleItemReachedWarehouseActive", function () {
    $(_this.steppersDom.reachedWarehouse.inactive).css('display', 'none');
    $(_this.steppersDom.reachedWarehouse.active).css('display', 'flex');
  });

  _defineProperty(this, "toggleItemDeliveringActive", function () {
    $(_this.steppersDom.delivering.inactive).css('display', 'none');
    $(_this.steppersDom.delivering.active).css('display', 'flex');
  });

  _defineProperty(this, "toggleItemDeliveredActive", function () {
    $(_this.steppersDom.delivered.inactive).css('display', 'none');
    $(_this.steppersDom.delivered.active).css('display', 'flex');
  });

  _defineProperty(this, "handleItemCancelledEvent", function () {
    // Hide everything
    Object.keys(_this.steppersDom).forEach(function (key) {
      $(_this.steppersDom[key].active).css('display', 'none');
      $(_this.steppersDom[key].inactive).css('display', 'none');
    }); // Show item cancelled stepper

    $(_this.steppersDom.cancelled.active).css('display', 'flex');
  });

  _defineProperty(this, "toggleItemIsReturned", function () {
    $(_this.steppersDom.returned.active).css('display', 'flex');
  });

  _defineProperty(this, "updateStatusBox", function (status) {
    var statusString = _this.statusStringMapper[status];
    $('#item-status').html(statusString);
    $('#item-ID').html(_this.itemId);
    $('#item-duration').html('Terima dalam 10-13 hari');
  });

  _defineProperty(this, "updateShippingInfo", function (courier, trackingRef, url) {
    $('#courier').html(courier);
    $('#Courier-url').html(url);
    $('#Courier-url').attr("href", url);
    $('#Tracking-ID').html(trackingRef);
  });

  _defineProperty(this, "fetchData", function () {
    // Do api call
    $.ajax({
      url: _this.url,
      // data: { signature: authHeader },
      type: "GET",
      beforeSend: function beforeSend(xhr) {
        xhr.setRequestHeader('Accept-Language', 'id-ID');
      },
      success: function success(response) {
        // Grab values
        var _response$data = response.data,
          status = _response$data.status,
          courier = _response$data.courier,
          trackingRef = _response$data.trackingRef,
          url = _response$data.url; // Update status box

        _this.updateStatusBox(status); // Update tracking info if available


        if (trackingRef && trackingRef.length > 0 && url && url.length > 0) {
          _this.updateShippingInfo(courier, trackingRef, url);
        } // Do status toggling logic. Basically the larger numbers will switch all of the prior ones on


        switch (status) {
          // Special case: Cancelled. Only 1 that will break. We will remove all the steppers
          case 9:
            _this.handleItemCancelledEvent();

            break;

          case 11:
          case 10:
            _this.toggleItemIsReturned();

          case 8:
            _this.toggleItemDeliveredActive();

          case 7:
            _this.toggleItemDeliveringActive();

          case 6:
          case 5:
          case 4:
            _this.toggleItemReachedWarehouseActive();

          case 3:
            _this.toggleItemShippedActive();

          case 2:
          case 1:
            _this.toggleItemProcessingActive();

        }
      },
      error: function error(_error) {
        // We swallow the errors, and display not found error
        $('.tracking-main-body').css('display', 'none'); // hide tracking stuff

        $('#error-message').css('display', 'flex'); // show error div

        if (_this.debugMode) {
          if (_error.responseJSON) {
            alert(_error.responseJSON.message);
          } else {
            alert(_error.responseText);
          }
        }
      }
    });
  });

  _defineProperty(this, "getUrlParameter", function (name) {
    var regex = new RegExp('[\\?&]' + name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]') + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  });

  // Constants
  this.steppersDom = {
    processing: {
      inactive: '#item-processing-inactive',
      active: '#item-processing-active'
    },
    shipped: {
      inactive: '#item-shipped-inactive',
      active: '#item-shipped-active'
    },
    reachedWarehouse: {
      inactive: '#item-reached-warehouse-inactive',
      active: '#item-reached-warehouse-active'
    },
    delivering: {
      inactive: '#item-delivering-inactive',
      active: '#item-delivering-active'
    },
    delivered: {
      inactive: '#item-delivered-inactive',
      active: '#item-delivered-active'
    },
    cancelled: {
      active: '#item-cancelled-active',
      inactive: ''
    },
    returned: {
      active: '#item-returned-active',
      inactive: ''
    }
  };
  this.statusStringMapper = {
    1: "Sedang Diproses",
    // "Processing",  || OrderItemStatusPendingGoodsOrder
    2: "Sedang Diproses",
    // "Processing",  || OrderItemStatusPendingFirstMile
    3: "Sedang Diproses",
    // "Processing",  || OrderItemStatusFirstMile
    4: "Sedang Diproses",
    // "Processing",  || OrderItemStatusOverseasWarehouseReceived
    5: "Dikirim",
    // "Shipped" || OrderItemStatusFreightForwarding
    6: "Pesanan tiba di gudang",
    // "Reached warehouse",  || OrderItemStatusLocalWarehouseReceived
    7: "Pesanan dikirim",
    // "Delivering",  || OrderItemStatusDelivering
    8: "Pesanan selesai",
    // "Delivered",  || OrderItemStatusDelivered
    9: "Dibatalkan",
    // "Cancelled", , || OrderItemStatusCancelled
    10: "Pesanan selesai",
    // "Delivered",  || OrderItemStatusPartiallyReturned
    11: "Pesanan selesai" // "Delivered" || OrderItemStatusReturned
    // this.searchParams = new URLSearchParams(window.location.search);

  };
  this.itemId = this.getUrlParameter('i');
  this.debugMode = this.getUrlParameter('debug');
  this.url = "https://ratesapp.co.id/rs/api/tracking?i=".concat(this.itemId); // prod
  // this.url = `https://staging.ratesapp.co.id/rs/api/tracking?i=${this.itemId}`; // staging
  // do api call

  this.fetchData();
} // Phase 1: Processing
  ; // Class runner


new ShippingTracker();
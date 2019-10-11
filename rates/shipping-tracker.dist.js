"use strict"; function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } } function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } var ShippingTracker = function ShippingTracker() { var _this = this; _classCallCheck(this, ShippingTracker); _defineProperty(this, "toggleItemProcessingActive", function () { $(_this.steppersDom.processing.inactive).css('display', 'none'); $(_this.steppersDom.processing.active).css('display', 'flex'); }); _defineProperty(this, "toggleItemShippedActive", function () { $(_this.steppersDom.shipped.inactive).css('display', 'none'); $(_this.steppersDom.shipped.active).css('display', 'flex'); }); _defineProperty(this, "toggleItemReachedWarehouseActive", function () { $(_this.steppersDom.reachedWarehouse.inactive).css('display', 'none'); $(_this.steppersDom.reachedWarehouse.active).css('display', 'flex'); }); _defineProperty(this, "toggleItemDeliveringActive", function () { $(_this.steppersDom.delivering.inactive).css('display', 'none'); $(_this.steppersDom.delivering.active).css('display', 'flex'); }); _defineProperty(this, "toggleItemDeliveredActive", function () { $(_this.steppersDom.delivered.inactive).css('display', 'none'); $(_this.steppersDom.delivered.active).css('display', 'flex'); }); _defineProperty(this, "handleItemCancelledEvent", function () { Object.keys(_this.steppersDom).forEach(function (key) { $(_this.steppersDom[key].active).css('display', 'none'); $(_this.steppersDom[key].inactive).css('display', 'none'); }); $(_this.steppersDom.cancelled.active).css('display', 'flex'); }); _defineProperty(this, "toggleItemIsReturned", function () { $(_this.steppersDom.returned.active).css('display', 'flex'); }); _defineProperty(this, "updateStatusBox", function (status, collectionMethod, collectionAmount) { var statusString = _this.statusStringMapper[status]; $('#item-status').html(statusString); $('#item-ID').html(_this.itemId); $('#item-duration').html('Terima dalam 10-13 hari'); if (collectionMethod === 'COD') { $('#Payment-Method').html('Cash on Delivery'); $('#Amount-to-pay-header').css('display', 'flex'); $('#Amount-To-Pay').html(collectionAmount); } else { $('#Payment-Method').html('Pembayaran Online'); } }); _defineProperty(this, "updateShippingInfo", function (courier, trackingRef, url) { $('#courier').html(courier); $('#Courier-url').html(url); $('#Courier-url').attr("href", url); $('#Tracking-ID').html(trackingRef); }); _defineProperty(this, "fetchData", function () { $.ajax({ url: _this.url, type: "GET", beforeSend: function beforeSend(xhr) { xhr.setRequestHeader('Accept-Language', 'id-ID'); }, success: function success(response) { var _response$data = response.data, status = _response$data.status, courier = _response$data.courier, trackingRef = _response$data.trackingRef, url = _response$data.url, collectionAmount = _response$data.collectionAmount, collectionMethod = _response$data.collectionMethod; _this.updateStatusBox(status, collectionMethod, collectionAmount); if (trackingRef && trackingRef.length > 0 && url && url.length > 0) { _this.updateShippingInfo(courier, trackingRef, url); } switch (status) { case 9: _this.handleItemCancelledEvent(); break; case 11: case 10: _this.toggleItemIsReturned(); case 8: _this.toggleItemDeliveredActive(); case 7: _this.toggleItemDeliveringActive(); case 6: case 5: case 4: _this.toggleItemReachedWarehouseActive(); case 3: _this.toggleItemShippedActive(); case 2: case 1: _this.toggleItemProcessingActive(); } }, error: function error(_error) { $('.tracking-main-body').css('display', 'none'); $('#error-message').css('display', 'flex'); if (_this.debugMode) { if (_error.responseJSON) { alert(_error.responseJSON.message); } else { alert(_error.responseText); } } } }); }); _defineProperty(this, "getUrlParameter", function (key) { var params = {}; var parser = document.createElement('a'); parser.href = window.location; var query = parser.search.substring(1); var vars = query.split('&'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split('='); params[pair[0]] = decodeURIComponent(pair[1]); } return params[key]; }); this.steppersDom = { processing: { inactive: '#item-processing-inactive', active: '#item-processing-active' }, shipped: { inactive: '#item-shipped-inactive', active: '#item-shipped-active' }, reachedWarehouse: { inactive: '#item-reached-warehouse-inactive', active: '#item-reached-warehouse-active' }, delivering: { inactive: '#item-delivering-inactive', active: '#item-delivering-active' }, delivered: { inactive: '#item-delivered-inactive', active: '#item-delivered-active' }, cancelled: { active: '#item-cancelled-active', inactive: '' }, returned: { active: '#item-returned-active', inactive: '' } }; this.statusStringMapper = { 1: "Sedang Diproses", 2: "Sedang Diproses", 3: "Sedang Diproses", 4: "Sedang Diproses", 5: "Dikirim", 6: "Pesanan tiba di gudang", 7: "Pesanan dikirim", 8: "Pesanan selesai", 9: "Dibatalkan", 10: "Pesanan selesai", 11: "Pesanan selesai" }; this.itemId = this.getUrlParameter('i'); this.debugMode = this.getUrlParameter('debug'); this.url = "https://ratesapp.co.id/rs/api/tracking?i=".concat(this.itemId); this.fetchData(); }; new ShippingTracker();
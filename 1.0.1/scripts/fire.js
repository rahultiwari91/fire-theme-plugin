/*!
 * FIRE Theme+Application Communication
 *
 * This 
 *
 * @version 1.0.1
 * @author Rahul Tiwari - https://github.com/rahultiwari91
 * @link NA
 * @copyright 2017 Rahul Tiwari 
 * @license Released under the MIT license.
 *
 * Contributors:
 *   NA - NA
 *
 * Last build: 2017-07-13 5:18:16 PM UTC
 */

"use strict";

//Immediately Invoked functional expression to wrap code
(function ($) {
	
	//Common for all events
	var appUrl = "https://421a4137.ngrok.io";
	
    //Defining Fire Construtor
    this.FIRE = function () {
        //Creating global element references
		this.appKey = null; //Fire App Key to verify customer is valid or not
		this.customerIdOrEmail = null; //Required
		this.tenantId = null; //Required
		this.siteId = null; //Required
		this.platform = null; //Required
		this.template = null;
        this.mppSliderContainer = null;
        this.pabSliderContainer = null;
		this.mppItemsCount = 10,
		this.pabItemsCount = 10;
		this.isNewsletterEnabled = null;
		this.mppItemsSorting = null;
		this.pabItemsSorting = null;
		this.mppClassName = null;
		this.pabClassName = null;
		this.mppMaxWidth = null;
		this.mppMinWidth = null;
		this.mppMaxHeight = null;
		this.mppMinHeight = nulll;
		this.pabMaxWidth = null;
		this.pabMinWidth = null;
		this.pabMaxHeight = null;
		this.pabMinHeight = nulll;
		
        // Define option defaults
        var defaults = {
			appKey: document.getAttribute("data-fire-app-key")
			customerIdOrEmail: document.getAttribute("data-fire-store-customerId"),
			tenantId: document.getAttribute("data-fire-tenantId"),
			siteId: document.getAttribute("data-fire-siteId"),
			fireClientId: document.getAttribute("data-fire-id"),
			platform: document.getAttribute("data-fire-platform"),
			template: document.getAttribute("data-fire-template"),
			isNewsletterEnabled: document.getAttribute("data-fire-newletter-enable"),
			mppSliderContainer: $("[data-fire-mpp]"),
			pabSliderContainer: $("[data-fire-pab]"),
            mppItemsSorting: document.getAttribute("data-fire-mpp-sorting"),
			pabItemsSorting: document.getAttribute("data-fire-pab-sorting"),
			mppClassName: 'fire-mpp-productlist',
			pabClassName: 'fire-pab-productlist',
            mppMaxWidth: 1280,
            mppMinWidth: 300,
            mppMaxHeight: 600,
			mppMinHeight: 400,
			pabMaxWidth = 1280,
			pabMinWidth = 300,
			pabMaxHeight = 600,
			pabMinHeight = 400
        };

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }
		console.log("FIRE initilized successfully.");
    };
	
	//Private Functions
	
	// Utility method to extend defaults with client options
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}
	
	
	//Public functions 
    FIRE.prototype.saveViewEvent = function (object) {
		console.log("Received view event.");
		var now = new Date(),
		
		//1. Get Customer - String
		customerIdOrEmail = object.customerIdOrEmail || this.options.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId || this.options.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId || this.options.siteId,
		
		//4. Product Code - String
		productCode = object.productCode,
		
		//5. Categories - Array
		categoriesOrCollections = object.categoriesOrCollections,
		
		//6. Prediction IO Object 
		predIOEvent = {};
		
		console.log("tenantid: " + tenantId + ", siteid: " + siteId, "CustomerId" + customerIdOrEmail + ", productCode: " + productCode);
		console.log("categories", categories);
	  
		//PIO data feeding
		predIOEvent.event = "view";
		predIOEvent.entityType = "user";
		predIOEvent.entityId = customerIdOrEmail; // it'll be "" for anon user
		predIOEvent.targetEntityType = "item";
		predIOEvent.targetEntityId = productCode; //Item code or product code or product Id
		predIOEvent.eventTime = new Date(now.toUTCString()); //UTC time.
	  
		//Fill properties
		predIOEvent.properties = {};
		//Feed properties if categories/collections are available
		if(categories.length > 0) {
			predIOEvent.properties.categories = categories;
		}
		console.log("predIOEvent:", predIOEvent);
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		var viewData = encodeURIComponent(JSON.stringify(predIOEvent)),
		restApi = appUrl + "/api/predictionio/collectviewevent?primaryId=" + tenantId + "&secondaryId=" + siteId + "&viewData=" + viewData,
		//Send request to save event data on server
		return jQuery.ajax({
			url  : restApi,
			headers: {
			  'Content-Type': 'application/javascript'
			},
			dataType: 'JSONP',
			cache : false,
			timeout : 10000,
			type : 'GET',
			success : function(data) {
				console.log("Success!");
				return JSON.parse('{"message":"Event saved successfully."}');
			},
			error : function(jqXHR, textStatus, errorThrown) {
				console.log("Error! No worries!");
				return JSON.parse('{"message":"Event not saved."}');
			}
		});
    };

    FIRE.prototype.savePurchaseEvent = function (object) {
		console.log("Received purchase event.");
		var now = new Date(),
		
		//1. Get Customer - String
		customerIdOrEmail = object.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId,
		
		//4. OrcedId - String
		orderId = object.orderId,
		
		//5. Order Object (Common Object, we don't know the platform) - JS object
		orderObject = object.orderObj,
		
		//6. Shopify Order Object 
		shopifyOrderObj = object.shopifyOrderObj,
		
		//7. KIBO order Object
		kiboOrderObj = object.kiboOrderObj,
		
		//8. PIO purchase event
		purchaseEventArray = [], //Need as many events as there are items
		
		//9. categoryIds - Array
		categoryIdArray = null,
		
		//10. Product Type - Array
		productTypeArray = null;
	  
		console.log("tenantid: " + tenantId + ", siteid: " + siteId);
		
		if (this.options.platform === "SHOPIFY" || this.options.platform.toString().toUpperCase() === "SHOPIFY") {
			//Shopify Platform order object 
			orderObject = (shopifyOrderObj !== null & shopifyOrderObj !== undefined) ? shopifyOrderObj : orderObject;
		} else if (this.options.platform === "KIBO" || this.options.platform.toString().toUpperCase() === "KIBO") {
			//KIBO Platform order object
			orderObject = (kiboOrderObj !== undefined & kiboOrderObj !== null) ? kiboOrderObj : orderObject;
		} else {
			orderObject = object.orderObj;
		}
		
		//Printing Platform object
		console.log("Order Object("+this.options.platform+"): ", orderObjectForMozu);
			  
		//PIO purchase event  - feed data
		for(var i = 0; i < orderObject.length; i++) {
			console.log(orderObject[i]);
			var predIOEvent = {};
			predIOEvent.event= "buy";
			predIOEvent.entityType= "user";
			predIOEvent.entityId= customerIdOrEmail; // it'll be "" for anon user
			predIOEvent.targetEntityType= "item";
			predIOEvent.targetEntityId = orderObject[i].product.id ? orderObject[i].product.id : orderObject[i].product.productCode;
			predIOEvent.eventTime= new Date(now.toUTCString()); //UTC time.
		  
			//PIO - Fill properties if available in order object
			predIOEvent.properties = {};
			categoryIdArray = [];
			productTypeArray = [];
			
			//PIO - Fill Categories 
			if (orderObject[i].product.categories) {
			  for(var j= 0; j < orderObject[i].product.categories.length; j++) {
				categoryIdArray.push("" + orderObject[i].product.categories[j].id);
			  }
			}
			console.log("Category Array: ", categoryIdArray);
			predIOEvent.properties.categories = categoryIdArray;
			
			//PIO - Fill productTypes if available in order object
			if (orderObject[i].product.productType !== "" | orderObject[i].product.productType !== null | orderObject[i].product.productType !== undefined | orderObject[i].product.productType !== "null") {
				productTypeArray.push(orderObject[i].product.productType);
			}
			predIOEvent.properties.productTypes = productTypeArray;
			//Push PIO Event data  
			purchaseEventArray.push(predIOEvent);
		}

		console.log("Purchase Event: ",purchaseEventArray);
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		
		//Encoding uri
		var viewData = encodeURIComponent(JSON.stringify(purchaseEventArray)),
		url = appUrl + "/api/predictionio/collectpurchaseevent?primaryId=" + tenantId + "&secondaryId=" + siteId +"&viewData="+viewData;
		
		//Send request to save event data on server
		return jQuery.ajax({
			url  : url,
			headers: {
			  'Content-Type': 'application/javascript'
			},
			dataType: 'JSONP',
			cache : false,
			timeout : 10000,
			type : 'GET',
			success : function(data) {
				console.log("Success!");
				return JSON.parse('{"message":"Event saved successfully."}');
			},
			error : function(jqXHR, textStatus, errorThrown) {
				console.log("Error! No worries!");
				return JSON.parse('{"message":"Event not saved."}');
			}
		});
    };

    FIRE.prototype.saveFireViewEvent = function (object) {
		console.log("Received FIRE view event.");
		var now = new Date(),
		//1. Get Customer - String
		customerIdOrEmail = object.customerIdOrEmail || this.options.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId || this.options.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId || this.options.siteId,
		
		//4. Product Code - String
		productCode = object.productCode,
		
		//5. Categories - Array
		categoriesOrCollections = object.categories,
		
		//6. FIRE View Event Object 
		roiViewEvent = {};
		
		console.log("tenantid: " + tenantId + ", siteid: " + siteId, "CustomerId" + customerIdOrEmail + ", productCode: " + productCode);
		console.log("categories", categories);
		  
		//FIRE - feed data
		roiViewEvent.productCode = productCode;
		roiViewEvent.userId = customerIdOrEmail;
		roiViewEvent.creationDate = new Date(now.toUTCString()); //UTC time.
		
		console.log("FIRE View Event: ", roiViewEvent);
		
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		
		//Encoding uri
		var viewData = encodeURIComponent(JSON.stringify(roiViewEvent)),
		url = appUrl + "/api/fire/collectroiviewevent?primaryId=" + tenantId + "&secondaryId=" + siteId +"&viewData="+viewData;
		
		//Send request to save event data on server
		return jQuery.ajax({
			headers : {
				'Content-Type': 'application/javascript;application/json;'
			},
			type : 'GET',
			url  : url,
			cache : false,
			timeout : 10000,
			dataType: "JSONP",
			success : function(data) {
				console.log("Success!");
				return JSON.parse('{"message":"Event saved successfully."}');
			},
			error : function(jqXHR, textStatus, errorThrown) {
				console.log("Error! No worries!");
				return JSON.parse('{"message":"Event not saved."}');
			}
		});
    };

    FIRE.prototype.saveFireATCEvent = function (object) {
		console.log("Received FIRE ATC events.");
		var now = new Date(),
		//1. Get Customer - String
		customerIdOrEmail = object.customerIdOrEmail || this.options.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId || this.options.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId || this.options.siteId,
		
		//4. Product Code - String
		productCode = object.productCode,
		
		//5. Cart Id - String 
		cartId = object.cartId,
		
		//6. Cart item Id 
		cartItemId = object.cartItemId,
		
		//7. FIRE AddToCart object
		roiATCConversionModel = {};
		
		console.log("tenantid: " + tenantId + ", siteid: " + siteId, "CustomerId" + customerIdOrEmail + ", productCode: " + productCode);
		
		//FIRE - Feed data
		roiATCConversionModel.creationDate = new Date(now.toUTCString());
		roiATCConversionModel.userId = customerIdOrEmail;
		roiATCConversionModel.productCode = productCode;
		roiATCConversionModel.cartId = cartId;
		roiATCConversionModel.cartItemId = cartItemId;
		console.log("FIRE ATC Event: ", roiATCConversionModel);
		
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		
		//Encoding uri
		var addToCartData = encodeURIComponent(JSON.stringify(roiATCConversionModel)),
		url = appUrl + "/api/fire/collectroiaddtocartevent?primaryId=" + tenantId + "&secondaryId=" + siteId +"&addToCartData="+addToCartData;
		
		//Send request to save event data on server
		return jQuery.ajax({
			headers: {
				'Content-Type': 'application/javascript;application/json;'
			},
			type: 'GET',
			url: url,
			cache: false,
			timeout: 60000,
			dataType: "JSONP",
			success: function(data) {
				console.log("Success!");
				return JSON.parse('{"message":"Event saved successfully."}');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error! No worries!");
				return JSON.parse('{"message":"Event not saved."}');
			}
		});
    };

    FIRE.prototype.saveFirePurchaseEvent = function (object) {
		console.log("Received FIRE purchase event.");
		var now = new Date(),
		
		//1. Get Customer - String
		customerIdOrEmail = object.customerIdOrEmail || this.options.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId || this.options.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId || this.options.siteId,
		
		//4. Cart Id - if platform is KIBI then it'll be originalCartId and if shopify then it'll be order.token - String
		origCartId = object.originalCartId,
		
		//5. Cart Id - String 
		cartId = object.cartId,
		
		//6. Order Id 
		orderId = object.orderId, 
		
		//7. Order Object
		orderObject = object.orderObj,
		
		//8. Shopify Order Object 
		shopifyOrderObj = object.shopifyOrderObj,
		
		//9. KIBO order Object
		kiboOrderObj = object.kiboOrderObj,
		
		//10. Order items
		orderSKUs = null,
		
		//FIRE purchase event
		roiConversionEventArray = []; //Need as many events as there are items
		
		if (this.options.platform === "SHOPIFY" || this.options.platform.toString().toUpperCase() === "SHOPIFY") {
			//Shopify Platform order object 
			orderId = orderObject.order_id;
			cartId = orderObject.token;
			orderObject = (shopifyOrderObj !== null & shopifyOrderObj !== undefined) ? shopifyOrderObj : orderObject;
			orderSKUs = orderObject.line_items;
		} else if (this.options.platform === "KIBO" || this.options.platform.toString().toUpperCase() === "KIBO") {
			//KIBO Platform order object
			cartId = origCartId;
			orderObject = (kiboOrderObj !== undefined & kiboOrderObj !== null) ? kiboOrderObj : orderObject;
			orderSKUs = orderObject.items;
		} else {
			orderObject = object.orderObj;
			orderSKUs = orderObject; //Common items list(Expecting Array of items)
		}
		
		//Printing Platform object
		console.log("Order Object("+this.options.platform+"): ", orderObject);
			  
		//FIRE - feed data
		for (var i = 0; i < orderSKUs.length; i++) {
			var roiConversionEvent = {};
			console.log("cart item", orderSKUs[i]);
			roiConversionEvent.cartId = cartId;
			roiConversionEvent.cartItemId = orderSKUs[i].variant_id ? orderSKUs[i].variant_id : orderSKUs[i].originalCartItemId;
			roiConversionEvent.orderId = orderId;
			roiConversionEvent.totalItemCost = orderSKUs[i].line_price ? orderSKUs[i].line_price : orderSKUs[i].discountedTotal; // it'll be "" for anon user
			roiConversionEvent.quantities = orderSKUs[i].quantity;
			roiConversionEvent.userId = customerIdOrEmail;
			roiConversionEvent.productCode = orderSKUs[i].product_id ? orderSKUs[i].product_id : orderSKUs[i].product.productCode;
			roiConversionEvent.creationDate = new Date(now.toUTCString()); //UTC time.
			
			roiConversionEventArray.push(roiConversionEvent);
		}

		console.log("FIRE purchase event: ",roiConversionEventArray);
		
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		
		//Encoding uri
		var purchaseData = encodeURIComponent(JSON.stringify(roiConversionEventArray)),
		url = appUrl + "/api/fire/collectroipurchaseevent?primaryId=" + tenantId + "&secondaryId=" + siteId +"&purchaseData="+purchaseData;
		
		//Send request to save event data on server
	    return jQuery.ajax({
			headers: {
				'Content-Type': 'application/javascript;application/json;'
			},
			type: 'GET',
			url: url,
			cache: false,
			timeout: 60000,
			dataType: "JSONP",
			success: function(data) {
				console.log("Success!");
				return JSON.parse('{"message":"Event saved successfully."}');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error! No worries!");
				return JSON.parse('{"message":"Event not saved."}');
			}
		});
    };
	
	//Most Popular Product - Get request to fetch MPP items with score
	FIRE.prototype.getMostPopularItems = function (object) {
		
		//1. Get Customer - String
		var customerIdOrEmail = object.customerIdOrEmail || this.options.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId || this.options.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId || this.options.siteId,
		
		//4. MPP items count
		mppItemsCount = object.mppItemsCount || this.options.mppItemsCount,
		
		//User Query to fetch MPP items list
		userQuery = {};
		userQuery.user = customerIdOrEmail;
		userQuery.num = mppItemsCount;
		userQuery = encodeURIComponent(JSON.stringify(userQuery));
		
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		
		var reqUrl = appUrl + '/api/predictionio/getRecommendedItems?userQuery=' + userQuery + '&primaryId=' + tenantId + '&secondaryId=' + siteId;
		
		return jQuery.ajax({
          headers: {
              'Content-Type': 'application/json;application/javascript;'
          },
          type: 'GET',
          url: reqUrl,
          cache: false,
          timeout: 60000,
          dataType: "JSONP",
          success: function(response) {
              return response;
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.log("FIRE MPP ERROR: ",errorThrown);
			  return null;
          }
      });
	};
	
	//People also Bought - Get request to fetch MPP items with score
	FIRE.prototype.getPeopleAlsoBoughtItems = function (object) {
		
		//1. Get Customer - String
		var customerIdOrEmail = object.customerIdOrEmail || this.options.customerIdOrEmail,
		
		//2. Get Tenant Id - Integer
		tenantId = object.tenantId || this.options.tenantId,
		
		//3. Get Site Id - Integer
		siteId = object.siteId || this.options.siteId,
		
		//4. PAB items count
		pabItemsCount = object.pabItemsCount || this.options.pabItemsCount,
		
		//User Query to fetch MPP items list
		userQuery = {};
		userQuery.user = customerIdOrEmail;
		userQuery.num = pabItemsCount;
		userQuery = encodeURIComponent(JSON.stringify(userQuery));
		
		//Parse the tenantId and siteId
		tenantId = parseInt(tenantId, 10);
		siteId = parseInt(siteId, 10);
		
		var reqUrl = appUrl + '/api/predictionio/getURRecommendedItems?userQuery=' + userQuery + '&primaryId=' + tenantId + '&secondaryId=' + siteId;
		
		return jQuery.ajax({
          headers: {
              'Content-Type': 'application/javascript;application/json;'
          },
          type: 'GET',
          url: reqUrl,
          cache: false,
          timeout: 60000,
          dataType: "JSONP",
          success: function(response) {
              return response;
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.log("FIRE PAB ERROR: ",errorThrown);
			  return null;
          }
      });
	};
	
	//Set Cookie 
	/**
	* Set Cookie
	* @param cname - Cookie name
	* @param cvalue - Cookie Value
	* @param exdays - Cookie expires days
	* @param domain - Cookie for the domain
	*/
	FIRE.prototype.setCookie = function(cname, cvalue, exdays, domain) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
      if (domain) {
      	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain="+domain;
      } else {
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }
    };
	
	//Get cookie
	/**
	* Get Cookie
	* @param cname - Cookie name
	* @return Cookie Value
	*/
	FIRE.prototype.getCookie = function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
	
	//Remove Cookie
	/**
	* Remove Cookie
	* @param cname - Cookie name
	*/
	FIRE.prototype.removeCookie = function(cname) {
        document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
	
}(jQuery));
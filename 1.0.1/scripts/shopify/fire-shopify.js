console.log("FIRE Checkout : ", Shopify.checkout);
var jQuery = window.Checkout.$ || window.$ || $;

jQuery(document).ready(function() {
    var fireObject = {},
        userId = __st.u,
        userMail = null,
        url = window.location.href,
        fireProductContainer = null;

    //TenentId and SiteId will be same for all actions
    window.tenantId = $('[data-fire-tenantId]');
    window.siteId = $('[data-fire-siteId]');
    fireObject.tenantId = window.tenantId;
    fireObject.siteId = window.siteId;

    //Check template to initialize the FIRE 
    var template = jQuery('[data-fire-template]').toString().toUpperCase();
    console.log("Template : " + template);
    if ("INDEX" === template || "HOME" === template) {
        userMail = $('[data-fire-store-customerId]');
        fireObject.customerIdOrEmail = userMail === undefined ? userId : userMail;
    } else if ("PRODUCT" === template) {
        checkouts
        //Product Page 
        var productModel = $('[data-fire-product-code]'),
            productCollections = $('[name="product-collection"]'),
            collections = [];
        for (var i = 0; i < productCollections.length; i++) {
            collections.push($(productCollections[i]).data('productCollection'));
        }

        console.log("Collections : ", collections);
        userMail = $('[data-fire-store-customerId]');

        fireObject.customerIdOrEmail = userMail === undefined ? userId : userMail;
        fireObject.categoriesOrCollections = collections;
        fireObject.productCode = productModel.id;
    } else if (url.search("checkouts") != -1 || url.search("orders") != -1) {
        //Order Confirmation Page 
        fireObject.orderObj = Shopify.checkout;
        fireObject.orderId = newOrder.order_id;
        userMail = newOrder.customer_id;
        fireObject.customerIdOrEmail = userMail === undefined ? userId : userMail;
    }

    var FireModel = new FIRE({
        customerIdOrEmail: fireObject.customerIdOrEmail,
        tenantId: fireObject.tenantId,
        siteId: fireObject.siteId,
        appKey: null,
        platform: "SHOPIFY",
        template: template,
        mppSliderContainer: $("[data-fire-mpp]"),
        pabSliderContainer: $("[data-fire-pab]"),
        isNewsletterEnabled: false,
        mppSorting: false,
        pabSorting: false
    });

    console.log("Tenant: " + tenantId + " Site: " + siteId);
    console.log("Customer ID: ", customerIdOrEmail);

    if ("INDEX" === template || "HOME" === template) {
        //Home or Index page - Get MPP Items
        var mppObject = {};
        mppObject.tenantId = FireModel.tenantId;
        mppObject.siteId = FireModel.siteId;
        mppObject.customerIdOrEmail = FireModel.customerIdOrEmail;
        mppObject.mppItemsCount = FireModel.mppItemsCount;

        var mostPopuItems = FireModel.getMostPopularItems(mppObject);
        if (mostPopuItems !== null) {
			fireProductContainer.append("<h3 class='heading'>Most Popular Products</h3>");
            fireProductContainer = FireModel.mppSliderContainer;
            var items = [];
            mostPopuItems = $.parseJSON(mostPopuItems);
            _.each(mostPopuItems.itemScores, function(itemScore) {
                items.push(itemScore.item);
            });
            getAllItemsAndRenderInSelector(items);
        }
    } else if ("PRODUCT" === template) {
        //Product Event Actions
        if (FireModel.getCookie("roidataactions") && url.search(FireModel.getCookie("roidataactions")) != -1) {
            //Fire Product View Action
            FireModel.saveFireViewEvent(fireObject);
        } else {
            //Product View Action
            FireModel.saveViewEvent(fireObject);
        }

        //Product Page - Get PAB Items
        var pabObject = {};
        pabObject.tenantId = FireModel.tenantId;
        pabObject.siteId = FireModel.siteId;
        pabObject.customerIdOrEmail = FireModel.customerIdOrEmail;
        pabObject.pabItemsCount = FireModel.pabItemsCount;

        var alsoBoughtItems = FireModel.getPeopleAlsoBoughtItems(pabObject);
        fireProductContainer = FireModel.pabSliderContainer;
        if (alsoBoughtItems !== null) {
			fireProductContainer.append("<h3 class='heading'>People Also Bought</h3>");
            fireProductContainer = FireModel.pabSliderContainer;
            var items = [];
            alsoBoughtItems = $.parseJSON(alsoBoughtItems);
            _.each(alsoBoughtItems.itemScores, function(itemScore) {
                items.push(itemScore.item);
            });
            getAllItemsAndRenderInSelector(items);
        }
    } else if (url.search("checkouts") != -1 || url.search("orders") != -1) {
        //Purchase Action
        FireModel.savePurchaseEvent(fireObject);
        if (localStorage.getItem("isROIItemsAdded") === 1 || localStorage.getItem("isROIItemsAdded") === "1") {
            //FIRE Purchase Action
            FireModel.saveFirePurchaseEvent(fireObject);
        };
    }

    //Theme.js functionality
    var cart = Shopify.getCart(function(data) {
        console.log("Cart : ", cart);
        return data;
    });

    //Overiding Shopify update cart trigger 
    /**
     * @Override Shopify onCartUpdate function to save ATC event 
     *
     */
    Shopify.onCartUpdate = function(cartObj) {
        console.log('There are now ' + cart.item_count + ' items in the cart.');
        if (FireModel.getCookie("roidataactions") && url.search(FireModel.getCookie("roidataactions")) != -1) {
            console.log("Cart Update event.");
            fireROIatcEventCall(cartObj);
        }
    };

    //ATC from FIRE slider 
    jQuery(document).on("click", ".fire-cart-button", function(e) {
        var productId = $(e.currentTarget).attr('data-product-code');
        e.preventDefault();
        jQuery.ajax({
            url: '/cart/add.js',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({
                quantity: 1,
                id: productId
            }),
            dataType: "json",
            type: "post",
            success: function(cartObj) {

                console.log("Success: ", cartObj);

                fireROIatcEventCall(cartObj);

            },
            error: function(error) {
                console.log("Error: ", error);
            }
        });
    });

    //Send ATC data to save on server
    function fireROIatcEventCall(cartObj) {
        var atcObject = {};
        atcObject.customerIdOrEmail = fireObject.customerIdOrEmail;
        atcObject.productCode = cartObj.product_id;
        atcObject.cartId = cart.token;
        atcObject.cartItemId = cartObj.id;
        atcObject.tenantId = tenantId;
        atcObject.siteId = siteId;
        //Request to save event on server
        FireModel.saveFireATCEvent(atcObject);
        //Setting cookie to check on checkout page if any item is added through MPP or PAB slider
        FireModel.setCookie("isROIItemsAdded", 1, 30, "checkout.shopify.com");
        localStorage.setItem("isROIItemsAdded", 1);
    }

    //Save FIRE Item in cookie
    function saveItemDetailsInROI(e) {
        e.preventDefault();
        var $currentTarget = $(e.currentTarget);
        var productURL = $currentTarget.context.dataset.ignFireProductView;
        var productCode = $currentTarget.context.dataset.ignFireProductCode;
        FireModel.setCookie("roidataactions", productURL.replace("/products/", "/"), 30, null);
        window.location.href = productURL;
    }

    //Create promise for each item to fetch from SHopify and append in to MPP/PAB location
    function getAllItemsAndRenderInSelector(items, fireProductContainer) {
        var productrep = [],
            product = null;
        for (var i = 0; i < items.length; i++) {
            product = Promise.resolve(getProductById(items[i]), fireProductContainer);
            productrep.push(product);
        }

        return Promise.all(productrep).then(function(response) {
            console.log(response);
            list.owlCarousel({
                autoplay: false,
                responsiveClass: true,
                loop: true,
                //Mouse Events
                touchDrag: true,
                navText: [
                    "<span class='glyphicon glyphicon-chevron-left'></span>",
                    "<span class='glyphicon glyphicon-chevron-right'></span>"
                ],
                responsive: {
                    0: {
                        items: 1,
                        loop: true,
                        stagePadding: 50,
                        nav: false
                    },
                    480: {
                        items: 3,
                        nav: false,
                        loop: true,
                        stagePadding: 50
                    },
                    1025: {
                        items: 5,
                        nav: true
                    }
                }
            });

        });
    }

    //Get product from shopify using product id
    function getProductById(productId, fireProductContainer) {
        var product = null,
            productVarId = null,
            productHandle = null,
            productImgUrl = null,
            productTitle = null;
        return new Promise(function(resolved, reject) {
            jQuery.ajax({
                type: 'GET',
                url: '/admin/products/' + productId + '.json',
                success: function(response) {
                    console.log(response);
                    product = response.product;
                    productHandle = product.handle;
                    productTitle = product.title;
                    productVarId = product.variants[0] ? product.variants[0].id : product.id;
                    productImgUrl = product.image.src;
                    console.log("ProductID", productVarId);

                    fireProductContainer.append('<div class="product-container"><div class="image-container"><a href="/products/' +
                        productHandle + '" onclick="saveItemDetailsInROI(event)"  data-ign-fire-product-code="' +
                        productVarId + '" data-ign-fire-product-view="/products/' +
                        productHandle + '"><img class="image" src="' +
                        productImgUrl + '" /></a></div><h4><a href="/products/' +
                        productHandle + '" onclick="saveItemDetailsInROI(event)" data-ign-fire-product-code="' +
                        productVarId + '" data-ign-fire-product-view="/products/' +
                        productHandle + '">' + productTitle + '</a></h4><span class="money">' +
                        Shopify.formatMoney(product.variants[0].price) + '</span><button class="fire-cart-button" data-product-code="' +
                        productVarId + '">Add To Cart</button></div>');
                    resolved(product);
                },
                error: function(error) {
                    console.log("Product Error: ", error);
                    reject(null);
                }
            }, reject);
        });
    }

});
var Promise = require('promise');
var request = require('request');
let duberUrl = "https://admin.duberex.com"

module.exports = {
  getBangForBuck: function (zip, amount, callback) {
    //TODO: sanitize input

    var cart = [];
    var moneyLeft = amount;
    stateFor(zip)
    .then(getRetailers)
    .then(validateRetailers)
    .then(pairWithDistance(zip))
    .then(removeFurtherThan20)
    .then(fetchProducts)
    .then(validateProducts)
    .then(sortProductsByBang)
    .then(function pickFirstThree(productList) {
      // The full list must have at least 3 different cannabis products
      // At least 1 product must be purchased from 3 different stores
      var variousStoreCount = 0;
      for ( var i = 0; i < productList.length; i ++) {
        let store = productList[i].processor
        if (!store) { continue; }
        let storeID = productList[i].processor.id;
        if (!storeID) { continue; }
        if (!cartIncludes(cart, storeID)) {
          cart.push(productList[i]);
          variousStoreCount++;
        }
        if (amountSpentOn(cart) > amount || variousStoreCount > 3) {
          break;
        }
      }
      cart.pop();
      moneyLeft = amount - amountSpentOn(cart);
      return productList;
    })
    .then(function spendRemainingMoney(productList) {
      while (amountSpentOn(cart) < amount) {
        cart.push(productList[0]);
      }
      cart.pop();
      //TODO: implement customized knapsack problem to spend rest of the money later
      console.log(cart);
      callback({
        "cartItems": cart,
        "moneySpent": amountSpentOn(cart)
      })
    })
    .catch(error => {
      console.log(error)
    })

  }
};

function cartIncludes(cart, storeID) {
  var found = false;
  for(var i = 0; i < cart.length; i++) {
      if (cart[i].processor.id === storeID) {
          return true;
      }
  }
  return found;
}
function sortProductsByBang(productList) {
  return new Promise(function (fulfill, reject) {
    fulfill(productList.sort(function (a,b) {
      let aBang = bangFor(a);
      let bBang = bangFor(b);
      if(aBang > bBang) return -1;
      if(aBang < bBang) return 1;
      return 0;
    }));
  });
}
function removeFurtherThan20(pairs){
  return new Promise(function (fulfill, reject) {
    let filtered = pairs.filter(eachPair => eachPair[0] < 20);
    fulfill(filtered.map(each => each[1]));
  });
}

function filterEmpty(products) {
  return products.filter(each => each !== {});
}

function pairWithDistance(zip) {
  return function allFilterPromises(retailers) {
    return Promise.all(retailers.map(eachRetailer => distancePairBetween(zip, eachRetailer)));
  }
}

function fetchProducts(retailers) {
  return Promise.all(retailers.map(eachRetailer =>  eachProductPromise(eachRetailer)));
}

function eachProductPromise(eachRetailer) {
  return new Promise(function (fulfill, reject) {
    // TODO: All products must be Flowers or Pre-Rolls (pre-rolled joints)
    let searchSuffix = "/search.json?auto_off=web_online&categories%5B%5D=Flowers%25&include_subcategory=false&offset=0&order_by=display_name&sort_order=asc&web_online=true";
    let endPoint = duberUrl + "/vendors/" + eachRetailer.id + searchSuffix;
    request(endPoint, function (error, response, body) {
      if (error) { reject(error); return;}
      try {
        let products = JSON.parse(response.body).products
        if (products) {
          fulfill(products);
        } else {
          fulfill({});
        }
      } catch(e) {
         fulfill({});
      }
      
    });
  });
}

function stateFor(zip) {
  return new Promise(function (fulfill, reject){
    let query = { "address": zip };
    googleMapsClient.geocode(query, function(err, result) {
      if (err) { reject(err); return; }
      fulfill(stateStringFrom(result));
    })
  });
}

function validateRetailers(retailers) {
  return new Promise(function(fulfill, reject) {
    let validated = retailers.filter(function (each) {
      return each.zip_code !== null && each.zip_code !== '' && !isNaN(each.zip_code)
    });
    if (validated.length === 0) {
      reject("There are no valid retailers");
    }
    fulfill(validated)
  });
}

function validateProducts(productLists) {
  return new Promise(function(fulfill, reject) {
      fulfill([].concat.apply([], productLists).filter(each => each !== {}));
  })
}
//gets a two-character state from Google's result
function stateStringFrom(result) {
  //for simplicity, assume second from last component
  //FIXME: use regex on 
  let components = result.json.results[0].address_components
  let stateString = components[components.length-2].short_name;
  return stateString;
}


function getRetailers(geoState){
  return new Promise(function (fulfill, reject){
    let endPoint = duberUrl + "/retailers.json?state=" + geoState;
    request(endPoint, function (error, response, body) {
      if (error) { reject(error); return; }
      try {
        fulfill(JSON.parse(response.body));
      } catch (e) {
        fulfill({});
      }
    });
  });
}

var googleMapsClient = require('@google/maps').createClient({
  key: "AIzaSyC_lcVpls7kY8fSkJKuP85ayS1GBwDw034"
});

//promise to calculate distance between two places in miles
//returns [Number distance, Retailer]
function distancePairBetween(zip, retailer) {
  return new Promise(function (fulfill, reject){
    let query = {
      "units": "imperial",
      "origins": zip,
      "destinations": retailer.zip_code,
    };

    googleMapsClient.distanceMatrix(query, function(err, result) {
      if (err) { reject(err); return; }
      fulfill([milesFrom(result), retailer]);
    });
    
  });
}

//Google sometimes doesn't give results, so MAX_VALUE instead...
function milesFrom(result) {
  let firstElement = result.json.rows[0].elements[0];
  if (firstElement.status === 'ZERO_RESULTS') {
    return Number.MAX_VALUE;
  } else {
    return parseInt(firstElement.distance.text.slice(0,-3));
  }
}

function bangFor(product) {
  return (product.thc_range.reduce((a,b)=>a+b) / product.thc_range.length) / (product.price);
}

function amountSpentOn(cart) {
  var cumSum = 0;
  for (var i = 0; i < cart.length; i++) {
    cumSum += cart[i].price;
  }
  return cumSum;
}


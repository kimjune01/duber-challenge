var Promise = require('promise');
var request = require('request');
let duberUrl = "https://admin.duberex.com"

module.exports = {
  getBangForBuck: function (zip, amount, callback) {
    //TODO: sanitize input
    stateFor(zip)
    .then(getRetailers)
    .then(validate)
    .then(filterNearby(zip))
    .then(function removeFurtherThan20(pairs){
      filtered = pairs.filter(eachPair => eachPair[0] < 20);
      seconds = filtered.map(function(each) {
        return each[1]
      });
      return seconds;
    })
    .then(flattenProducts)
    .then(function inspect(things){
        console.log("things[0]" ,things[0]);
    }).catch(error => {
      console.log(error)
    })
    // At least 1 product must be purchased from 3 different stores
    // The full list must have at least 3 different cannabis products
    // All products must be Flowers or Pre-Rolls (pre-rolled joints)
    
    callback({
      "yay": "yay",
      "stores": [
        {
          "weedhouse": {
            "location": {
              "lat": 49,
              "long": -109
            },
            "products": [
              {
                "purple kush": {
                  "price": 2,
                  "amount": 1
                }
              }
            ]
          }
        }
      ]
    })
  }
};

function filterNearby(zip) {
  return function allFilterPromises(retailers) {
    return Promise.all(distancePromises(zip, retailers));
  }
}
//returns an array of products from all the retailers
function flattenProducts(retailers) {
  return Promise.all(productPromises(retailers))
}

function productPromises(retailers) {
  return retailers.map(eachRetailer =>  eachProductPromise(eachRetailer));
}

//example: 
//https://admin.duberex.com/vendors/748abe3e-fccf-4265-8b87-a5f2d73c52ae/search.json?auto_off=web_online&categories%5B%5D=Flowers%25&include_subcategory=false&limit=50&metadata=1&offset=0&order_by=display_name&sort_order=asc&web_online=true
function eachProductPromise(eachRetailer) {
  return new Promise(function (fulfill, reject) {
    let searchSuffix = "/search.json?auto_off=web_online&categories%5B%5D=Flowers%25&include_subcategory=false&offset=0&order_by=display_name&sort_order=asc&web_online=true";
    let endPoint = duberUrl + "/vendors/" + eachRetailer.id + searchSuffix;
    request(endPoint, function (error, response, body) {
      if (error) { reject(error); return;}
      //TODO: try/catch on JSON.parse and fulfill on good parsables.
      let products = JSON.parse(response.body).products
      if (products) {
        console.log(products[0]);
        fulfill(products);
      } else {
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

function validate(retailers) {
  //console.log("retailers.length: ", retailers.length);
  return new Promise(function(fulfill, reject) {
    let validated = retailers.filter(function (each) {
      return each.zip_code !== null && each.zip_code !== '' && !isNaN(each.zip_code)
    });
    if (validated.length === 0) {
      reject("There are no valie retailers");
    }
    // console.log("validated.length: ", validated.length);
    fulfill(validated)
  });
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
      fulfill(JSON.parse(response.body));
    });
  });
}

var googleMapsClient = require('@google/maps').createClient({
  key: "AIzaSyC_lcVpls7kY8fSkJKuP85ayS1GBwDw034"
});

//returns an array of promises for resolving later 
function distancePromises(zip, retailers) {
  return retailers.map(eachRetailer => distanceBetween(zip, eachRetailer));

}

//promise to calculate distance between two places in miles...
function distanceBetween(zip, retailer) {
  return new Promise(function (fulfill, reject){
    let query = {
      "units": "imperial",
      "origins": zip,
      "destinations": retailer.zip_code,
    };

    fulfill([2, retailer]); 
    return;

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


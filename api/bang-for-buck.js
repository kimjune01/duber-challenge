module.exports = {
  getBangForBuck: function (zip, amount, callback) {
    //TODO: sanitize input
    //TODO: if infeasible, return error message
    //call endpoint
    //get retailers
    getRetailersFor(stateFor(zip), function(retailers) {
      // then, filter by closest 20 miles
        //TODO: filter retailers without location...
      console.log("retailers.length", retailers.length);
      let exampleRetailer = retailers[0];
      console.log(exampleRetailer);
      let retailersWithLocation = retailers.filter(function (el) {
        return el.zip_code !== null &&
                el.zip_code !== '' &&
                isNaN(el)
      });
      console.log("retailersWithLocation", retailersWithLocation);
    })
    //     At least 1 product must be purchased from 3 different stores
    // All stores must be within 20 miles of the user's location
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

var request = require('request');
let duberUrl = "https://admin.duberex.com"

function stateFor(zip) {
  return "WA"
}

function getRetailersFor(geoState, callback) {
  let endPoint = duberUrl + "/retailers.json?state=" + geoState;
  console.log("endPoint: ", endPoint);
  request(endPoint, function (error, response, body) {
    //TODO: handle error gracefully...
    callback(JSON.parse(response.body));
  });
}


let GMAP_API_KEY = "AIzaSyC_lcVpls7kY8fSkJKuP85ayS1GBwDw034"



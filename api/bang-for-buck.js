module.exports = {
  getBangForBuck: function (zip, amount, callback) {
    //TODO: sanitize input
    //TODO: if infeasible, return error message
    //call endpoint
    //get retailers
    getRetailersFor(stateFor(zip), function validateRetailers(retailers) {
      // then, filter by closest 20 miles
        //TODO: filter retailers without location...
      let exampleRetailer = retailers[0];
      let retailersWithLocation = retailers.filter(function (el) {
        return el.zip_code !== null && el.zip_code !== '' && !isNaN(el.zip_code)
      });
      return retailersWithLocation
    }).then(function distanceFilterRetailers(retailers) {
      //let sampleDistance = distanceBetween(retailersWithLocation[0], retailersWithLocation[1]);
      console.log("distanceFilterRetailers retailers", retailers);
    })
    //TODO: finally promise!

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

var googleMapsClient = require('@google/maps').createClient({
  key: "AIzaSyC_lcVpls7kY8fSkJKuP85ayS1GBwDw034"
});


//distance between two places in miles...
function distanceBetween(zip1, zip2) {
  //TODO: ask google for distance!!
  console.log("googleMapsClient.distanceMatrix:", googleMapsClient.distanceMatrix);
  let query = {
    "units": "imperial",
    "origins": "12345",
    "destinations": "43214",
  };
  let distance = googleMapsClient.distanceMatrix(query, function(result) {
    console.log("distanceMatrix result:", result);
  });
  console.log("distance:", distance);
  return 1;
}

/*
exports.distanceMatrix = {
  url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
  validator: v.compose([
    v.mutuallyExclusiveProperties(['arrival_time', 'departure_time']),
    v.object({
      origins: utils.pipedArrayOf(utils.latLng),
      destinations: utils.pipedArrayOf(utils.latLng),
      mode: v.optional(v.oneOf([
        'driving', 'walking', 'bicycling', 'transit'
      ])),
      language: v.optional(v.string),
      region: v.optional(v.string),
      avoid: v.optional(utils.pipedArrayOf(v.oneOf([
        'tolls', 'highways', 'ferries', 'indoor'
      ]))),
      units: v.optional(v.oneOf(['metric', 'imperial'])),
      departure_time: v.optional(utils.timeStamp),
      arrival_time: v.optional(utils.timeStamp),
      transit_mode: v.optional(utils.pipedArrayOf(v.oneOf([
        'bus', 'subway', 'train', 'tram', 'rail'
      ]))),
      transit_routing_preference: v.optional(v.oneOf([
        'less_walking', 'fewer_transfers'
      ])),
      traffic_model: v.optional(v.oneOf([
        'best_guess', 'pessimistic', 'optimistic'
      ])),
      retryOptions: v.optional(utils.retryOptions),
      timeout: v.optional(v.number)
    })
  ])
};

*/

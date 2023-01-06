//jshint esversion:6

// Initializes the app, mailchimp client, and other packages.
const { response } = require('express');
const express = require('express');
const app = express();
const http = require('node:http');
const https = require('node:https');
const { url } = require('node:inspector');
const bodyParser = require('body-parser');

// OpenWeather env vars can be assigned here.
const get_Geo_City = "http://api.openweathermap.org/geo/1.0/direct";
const get_Geo_Zip = "http://api.openweathermap.org/geo/1.0/zip";
const get_EndPoint_Current = "https://api.openweathermap.org/data/2.5/weather";
const key = / Environment variable for key here /;
const param_1 = "appid=" + key;

// Body Parser
app.use(bodyParser.urlencoded({extended: true}));

// Routes to the home page for input of weather location.
app.get('/', function(req, resp) {
  resp.sendFile(__dirname + "/index.html");
});

// Routes from the POST request form to get weather through API.
app.post('/', function(req, resp) {
  var cityName = req.body.city;
  var zipCode = req.body.zip;
  var mainTemp = "";
  var mainWeather = "";
  var mainIcon = "";
  var units = "imperial";

  // Determines which GEO endpoint to use for getting lat/lon. 
  if (zipCode === 0) {
    var url1 = get_Geo_City + "?" + param_1 + "&q=" + cityName;
  } else {
    var url1 = get_Geo_Zip + "?" + param_1 + "&zip=" + zipCode;
  }

  // Promise function to get the lat/lon and stick object in resolve.
  const promise = new Promise((resolve, reject) =>{http.get(url1, (call1) => {
    stats = call1.statusCode;
    call1.setEncoding('utf-8');
    let dataOb = '';
    call1.on('data', (data) => {dataOb += data;});
    call1.on('end', () => {
      coordloc = JSON.parse(dataOb);
      resolve(coordloc);
    });
    });
  });

  // Using the resolve then iterate through the object to assign lat/lon.
  promise.then(d => {
    if (zipCode !== null) {
      var lat = d.lat;
      var lon = d.lon;
    } else {
      var lat = d[0].lat;
      var lon = d[0].lon;
    }

    // Insert lat lon into url for weather endpoint.
    var url2 = get_EndPoint_Current + "?" + param_1 + "&lat=" + lat + "&lon=" + lon + "&units=" + units;

    // Next promise then step is to call the get of eather and send response.
    https.get(url2, (call2) => {
      stats = call2.statusCode;
      call2.setEncoding('utf-8');
      let dataOb2 = '';
      call2.on('data', (data) => {dataOb2 += data;});
      call2.on('end', () => {
        coordloc2 = JSON.parse(dataOb2);
        mainTemp = coordloc2.main.temp;
        mainWeather = coordloc2.weather[0].description;
        mainIcon = coordloc2.weather[0].icon;
        mainImg = "<img src='http://openweathermap.org/img/wn/" + mainIcon + "@2x.png'></img>"
        resp.write("<h1>The weather in " + cityName + " is " + mainTemp + " degrees Farenheight!</h1>");
        resp.write("<h2>The current condition is " + mainWeather + ".</h2>" + mainImg);
        resp.send();
      });
    });
  });

});

// Other routes as basic placeholders no real purpose aside from notification.
app.get('/contact', function(req, res) {
    res.send("Dont. I'll find you.");
});

app.get('/about', function(req, res) {
    res.send("This is me.");
});

app.listen(3000, function (){
    console.log("Server started on Port 3000.")
});


// EXAMPLE of parsing a request body without the in-built Express.js
// body parser in use. I put this into practice in case the
// body parser could not be used for some reason.

// req.setEncoding('utf-8');
//   let sT = '';
//   req.on('data', (chunk) => {sT += chunk;});
//   req.on('end', () => {
//     const parseIt = new URLSearchParams(sT);
//     const dataObj = {};
//     console.log(parseIt.entries(0));
//     for (var pair of parseIt.entries()) {
//       dataObj[pair[0]] = pair[1];
//     }
//     console.log(dataObj.city);
//   });

// EXAMPLE OF PROMISE FUNC SKELETON
// Taught myself the concept of promise since the original course I was
// taking only used one call but OpenWeather now needs two calls
// with one to get the lat and lon and another to call the weather.

// function httpRequest(params, postData) {
//   return new Promise(function(resolve, reject) {
//       var req = http.request(params, function(res) {
//           // reject on bad status
//           if (res.statusCode < 200 || res.statusCode >= 300) {
//               return reject(new Error('statusCode=' + res.statusCode));
//           } // no else needed
//           var body = '';
//           res.on('data', (data) => {body += data;});
//           res.on('end', () => {
//               try {
//                   body = JSON.parse(dataOb);
//               } catch(e) {
//                   reject(e);
//               }
//               resolve(body);
//           });
//       });
//       // reject on request error
//       req.on('error', function(err) {
//           // This is not a "Second reject", just a different sort of failure
//           reject(err);
//       });
//       if (postData) {
//           req.write(postData);
//       }
//       // IMPORTANT
//       req.end();
//   });
// }
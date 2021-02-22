const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const fetch = require("node-fetch");
const config = require("./config.json");
const request = require("request");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.listen(9000, () => {
  console.log(`Server is running.`);
});

var requestAsync = function (url) {
  return new Promise((resolve, reject) => {
    var req = request(url, (err, response, body) => {
      if (err) return reject(err, response, body);
      resolve(JSON.parse(body));
    });
  });
};

var getParallel = async function (urls) {
  //transform requests into Promises, await all
  var data;
  try {
    data = await Promise.all(urls.map(requestAsync));
  } catch (err) {
    console.error(err);
  }
  // console.log(data);
  return data;
};

app.get("/ta/:lng;:lat;:distance", db.distanceTA);

app.get("/checkta/:lng;:lat", async (req, res) => {
  var cikti;
  const lng = req.params.lng;
  const lat = req.params.lat;
  const datalist = [];
  let url = `http://localhost:9000/ta/${lng};${lat};500`;
  let fetchdata = await fetch(url);
  let data = await fetchdata.json();
  if (data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      datalist.push(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${lng},${lat};${data[0].st_x},${data[0].st_y}?geometries=geojson&access_token=${config.MAPBOXAPI}`
      );
    }
  } else {
    url = `http://localhost:9000/ta/${lng};${lat};1000`;
    fetchdata = await fetch(url);
    data = await fetchdata.json();
    if (data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        datalist.push(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${lng},${lat};${data[0].st_x},${data[0].st_y}?geometries=geojson&access_token=${config.MAPBOXAPI}`
        );
      }
    } else {
      url = `http://localhost:9000/ta/${lng};${lat};1500`;
      fetchdata = await fetch(url);
      data = await fetchdata.json();
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          datalist.push(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${lng},${lat};${data[0].st_x},${data[0].st_y}?geometries=geojson&access_token=${config.MAPBOXAPI}`
          );
        }
      }
    }
  }
  if (datalist.length > 0) {
    var durations = [];
    const gelenler = await getParallel(datalist);
    for (var k = 0; k < gelenler.length; k++) {
      if (gelenler[k].routes.length > 0) {
        durations.push(gelenler[k].routes[0].duration);
      }
    }
    var minIndex = durations.indexOf(Math.min.apply(Math, durations));
    cikti = gelenler[minIndex];
  } else {
    cikti = { data: "no data" };
  }
  res.status(200).json(cikti);
});

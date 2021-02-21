const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const fetch = require("node-fetch");
const config = require("./config.json");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.listen(9000, () => {
  console.log(`Server is running.`);
});

app.get("/ta/:lng;:lat;:distance", db.distanceTA);

app.get("/checkta/:lng;:lat", async (req, res) => {
  const lng = req.params.lng;
  const lat = req.params.lat;
  const url = `http://localhost:9000/ta/${lng};${lat};500`;
  const fetchdata = await fetch(url);
  const data = await fetchdata.json();
  const datalist = [];
  for (var i = 0; i < data.length; i++) {
    datalist.push(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${lng},${lat};${data[0].st_x},${data[0].st_y}?geometries=geojson&access_token=${config.MAPBOXAPI}`
    );
  }
  const url1 = `https://api.mapbox.com/directions/v5/mapbox/walking/${lng},${lat};${data[0].st_x},${data[0].st_y}?geometries=geojson&access_token=${config.MAPBOXAPI}`;
  const fetchdata1 = await fetch(url1);
  const data1 = await fetchdata1.json();
  res.status(200).json(data1);
});

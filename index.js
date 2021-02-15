const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.listen(9000, () => {
  console.log(`Server is running.`);
});

app.get("/api/v1/ta/:lng;:lat;:distance", db.distanceTA);

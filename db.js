// st_x => lng
// st_y => lat

const Pool = require("pg").Pool;
const axios = require("axios");
const config = require("./config.json");
const pool = new Pool({
  user: config.USERNAME,
  password: config.PASSWORD,
  host: config.HOST,
  database: config.DATABASE,
  port: parseInt(config.PORT),
});

const getTAdirection = async (lng, lat, taList) => {
  try {
    console.log(taList);
    console.log(config.MAPBOXAPI);
    var durations = [];
    for (var i = 0; i < taList.length; i++) {
      var result = await axios
        .get(
          "https://api.mapbox.com/directions/v5/mapbox/walking/" +
            lng +
            "," +
            lat +
            ";" +
            taList[i]["st_x"] +
            "," +
            taList[i]["st_y"] +
            "?geometries=geojson&access_token=" +
            config.MAPBOXAPI
        )
        .then((res) => {
          durations.push(res["data"]["routes"][0]["duration"]);
        });
      // return result;
      // .then((res) => console.log(res["data"]["routes"][0]["duration"]));
    }
    return durations;
  } catch (error) {
    console.log(error);
  }
};

const distanceTA = (request, response) => {
  const lng = parseFloat(request.params.lng);
  const lat = parseFloat(request.params.lat);
  let distance = parseInt(request.params.distance);
  const sql =
    "select ta.gid, ta.layer, ta.kod, st_x(st_transform(st_centroid(ta.geom),4326)), st_y(st_transform(st_centroid(ta.geom),4326)) from " +
    config.TABLE +
    " ta where st_contains(ST_Buffer(st_transform(ST_GeomFromText('POINT(" +
    lng +
    " " +
    lat +
    ")', 4326), 5254)," +
    distance +
    ",'quad_segs=8'),ta.geom);";
  pool.query(sql, [], (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rowCount > 0) {
      // var a = axios
      //   .get(
      //     "https://api.mapbox.com/directions/v5/mapbox/walking/" +
      //       lng +
      //       "," +
      //       lat +
      //       ";" +
      //       results.rows[0]["st_x"] +
      //       "," +
      //       results.rows[0]["st_y"] +
      //       "?alternatives=true&geometries=geojson&steps=true&access_token=" +
      //       config.MAPBOXAPI
      //   )
      //   .then((res) => {
      //     console.log(res);
      //   });
      var asd = getTAdirection(lng, lat, results.rows);
      console.log(asd);
      console.log("as");

      response.status(200).json(results.rows);
    } else {
      distance = 1000;
      var sqll =
        "select ta.gid, ta.layer, ta.kod, st_x(st_transform(st_centroid(ta.geom),4326)), st_y(st_transform(st_centroid(ta.geom),4326)) from " +
        config.TABLE +
        " ta where st_contains(ST_Buffer(st_transform(ST_GeomFromText('POINT(" +
        lng +
        " " +
        lat +
        ")', 4326), 5254)," +
        distance +
        ",'quad_segs=8'),ta.geom);";
      pool.query(sqll, [], (error, results) => {
        if (error) {
          throw error;
        }
        if (results.rowCount > 0) {
          response.status(200).json(results.rows);
        } else {
          distance = 1500;
          var sqll =
            "select ta.gid, ta.layer, ta.kod, st_x(st_transform(st_centroid(ta.geom),4326)), st_y(st_transform(st_centroid(ta.geom),4326)) from " +
            config.TABLE +
            " ta where st_contains(ST_Buffer(st_transform(ST_GeomFromText('POINT(" +
            lng +
            " " +
            lat +
            ")', 4326), 5254)," +
            distance +
            ",'quad_segs=8'),ta.geom);";
          pool.query(sqll, [], (error, results) => {
            if (error) {
              throw error;
            }
            response.status(200).json(results.rows);
          });
        }
      });
    }
  });
};

module.exports = {
  distanceTA,
};

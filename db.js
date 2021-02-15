const Pool = require("pg").Pool;
const config = require("./config.json");
const pool = new Pool({
  user: config.USERNAME,
  password: config.PASSWORD,
  host: config.HOST,
  database: config.DATABASE,
  port: parseInt(config.PORT),
});

const distanceTA = (request, response) => {
  const lng = parseFloat(request.params.lng);
  const lat = parseFloat(request.params.lat);
  const distance = parseInt(request.params.distance);
  console.log(lat);
  console.log(lng);
  console.log(distance);
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
    response.status(200).json(results.rows);
  });
};

module.exports = {
  distanceTA,
};

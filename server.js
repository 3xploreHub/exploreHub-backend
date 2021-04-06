const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dbConfig = require("./database/db");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

mongoose.set("useCreateIndex", true);
mongoose.connect(dbConfig.online_db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

var db = mongoose.connection;
db.on("connected", () => {
  console.log("connected to database" + dbConfig.online_db);
});
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(morgan("common"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var publicDir = require('path').join(__dirname, '/uploads');
app.use(express.static(publicDir));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.use("/api", require("./router/mainRouter"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

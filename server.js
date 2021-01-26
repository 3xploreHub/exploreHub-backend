const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dbConfig = require("./database/db");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");

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

app.use("/static", express.static(path.join(__dirname, "uploads")));
console.log(__dirname);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", require("./router/mainRouter"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

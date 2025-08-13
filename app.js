require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const userModel = require("./models/userModel");

const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/pinterest_clone";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());

app.use(
  expressSession({
    resave: false,
    saveUninitialized: true,
    secret:
      process.env.SESSION_SECRET ||
      "2180253a7dce9ab2db91acfc3caf062ff3aef97bcdeff9e86e520b2d60b89a06635903e0ecf3bff5a769de0bcad3a8b8fe51cb105e733b1d32612d8c8ba5bd95",
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

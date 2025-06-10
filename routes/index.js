var express = require("express");
var router = express.Router();

const userModel = require("../models/userModel");
const postModel = require("../models/postsModel");

const passport = require("passport");
const upload = require("./multer");
const localStrategy = require("passport-local").Strategy;
passport.use(
  new localStrategy({ usernameField: "email" }, userModel.authenticate())
);

router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});
router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({
      email: req.session.passport.user,
    })
    .populate("posts");
  const { username, fullName } = extractNameAndUsername(user.email);
  // console.log(user.posts);
  res.render("profile", {
    email: user.email,
    username: username,
    fullName: fullName,
    user,
    nav: true,
  });
});

router.get("/posts/show", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({
      email: req.session.passport.user,
    })
    .populate("posts");
  res.render("show", { user, nav: true });
});

router.get("/add", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    email: req.session.passport.user,
  });
  const { username, fullName } = extractNameAndUsername(user.email);
  res.render("add", {
    email: user.email,
    username: username,
    fullName: fullName,
    user,
    nav: true,
  });
});
router.post(
  "/createpost",
  isLoggedIn,
  upload.single("postimage"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      email: req.session.passport.user,
    });
    console.log(req.file);
    const post = await postModel.create({
      postedBy: user._id,
      content: req.body.content,
      description: req.body.description,
      postimage: req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

// router.post(
//   "/upload",
//   isLoggedIn,
//   upload.single("file"),
//   async function (req, res, next) {
//     if (!req.file) {
//       return res.status(400).send("No file uploaded.");
//     }
//     const user = await userModel.findOne({ email: req.session.passport.user });

//     const post = await postModel.create({
//       postimage: req.file.filename,
//       content: req.body.content,
//       postedBy: user._id,
//     });
//     user.posts.push(post._id);
//     await user.save();
//     res.redirect("/profile");
//   }
// );
router.post(
  "/pfpup",
  isLoggedIn,
  upload.single("pfpimage"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const user = await userModel.findOne({ email: req.session.passport.user });
    user.pfp = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/feed", async function (req, res, next) {
  // const user = await userModel
  //   .findOne({
  //     email: req.session.passport.user,
  //   })
  //   .populate("posts");
  const posts = await postModel.find().populate("postedBy");
  res.render("feed", { posts, nav: true });
});

router.post("/signup", function (req, res, next) {
  const { email, password, dob } = req.body;
  const userData = new userModel({
    dob,
    email,
  });
  userModel.register(userData, password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});
router.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error"), nav: false });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
function extractNameAndUsername(email) {
  const username = email.split("@")[0];

  const nameParts = username
    .replace(/[0-9]/g, "") // Remove numbers
    .split(/[._]/) // Split on dot or underscore
    .filter((part) => part.length > 0); // Ignore empty parts

  const fullName = nameParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize
    .join(" "); // Join with space

  return {
    username: username,
    fullName: fullName,
  };
}

module.exports = router;

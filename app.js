require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "working with angela yu is fun",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })
  .then((result) => {
    app.listen(3000, () => {
      console.log("App started");
    });
  })
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  // Email: {
  //   type: String,
  //   required: true,
  // },
  // Password: {
  //   type: String,
  //   required: true,
  // },
  email: String,

  password: String,
});

userSchema.plugin(passportLocalMongoose);

// on this code i was using the md5 to encryote my password
// userSchema.plugin(encrypt, {
//   secret: process.env.ENCKEY,
//   encryptedFields: ["Password"],
// });
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

// login route
app
  .route("/login")

  .get((req, res) => {
    res.render("login");
  })

  //   on this code i was using bcrypt to encrypt my password
  //   .post((req, res) => {
  //     const userName = req.body.username;
  //     const password = req.body.password;

  //     User.findOne({ Email: userName })
  //       .then((result) => {
  //         if (result) {
  //           bcrypt.compare(password, result.Password, function (err, bresult) {
  //             if (bresult === true) {
  //               res.render("secrets");
  //             }
  //           });
  //         }
  //       })
  //       .catch((err) => console.log(err));
  //   });

  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

// logout Route

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

//   resgister route
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//   on this code i was using bcrypt to encrypt my password
// app.post("/register", (req, res) => {
//   bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//     const newUser = new User({
//       Email: req.body.username,
//       Password: hash,
//     });

//     newUser
//       .save()
//       .then((result) => res.render("secrets"))
//       .catch((err) => console.log(err));
//   });
// });

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);

        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

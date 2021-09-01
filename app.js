require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })
  .then((result) => {
    app.listen(3000, () => {
      console.log("App started");
    });
  })
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
});

// userSchema.plugin(encrypt, {
//   secret: process.env.ENCKEY,
//   encryptedFields: ["Password"],
// });

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")

  .get((req, res) => {
    res.render("login");
  })

  .post((req, res) => {
    const userName = req.body.username;
    const password = req.body.password;

    User.findOne({ Email: userName })
      .then((result) => {
        if (result) {
          bcrypt.compare(password, result.Password, function (err, bresult) {
            if (bresult === true) {
              res.render("secrets");
            }
          });
        }
      })
      .catch((err) => console.log(err));
  });

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      Email: req.body.username,
      Password: hash,
    });

    newUser
      .save()
      .then((result) => res.render("secrets"))
      .catch((err) => console.log(err));
  });
});

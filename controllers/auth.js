//Importing the result of validation route
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  //Extrating errors, if exists
  const errors = validationResult(req);
  //If errors
  if (!errors.isEmpty()) {
    const error = new Error("Validation error.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  //Encripting the password
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      //Creating a new user in mongodb
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      //Setting the status for new resource and send json msg with the userid
      res.status(201).json({ userId: result._Id, message: "User created!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  //Retrieving the data
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  let loadedUser;

  //Searching for the user in mongodb
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("No user found!");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      //Comparing the passwords, this return a promise
      return bcrypt.compare(password, user.password);
    })
    //then, if not equal
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.status = 401;
        throw error;
      }
      //Creating a new signature for token
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        //Passing a private key to use for signing the token
        "ultrasecretconcontoken",
        { expiresIn: "1h" }
      );
      //Returning the response to client
      res.status(200).json({token: token, userId: loadedUser._id.toString()})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

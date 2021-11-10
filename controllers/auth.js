//Importing the result of validation route
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require('../models/user')

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
    .then(hashedPw => {
        //Creating a new user in mongodb
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        })
        return user.save()
    }).then(result => {
        //Setting the status for new resource and send json msg with the userid
        res.status(201).json({userId: result._Id, message: 'User created!'})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

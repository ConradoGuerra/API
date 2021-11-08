//Importing the result of validation route
const { validationResult } = require("express-validator");

//Importing the post model
const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
  //Sending a response to client as JSON format
  res.status(200).json({
    posts: [
      {
        _id: "1",
        creator: {
          name: "Conrado",
        },
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "/images/livros.jpg",
        createdAt: Date.now(),
      },
    ],
  });
};

exports.postPosts = (req, res, next) => {
  //Assining the validationResult to a variable
  const errors = validationResult(req);
  //If an error exists
  if (!errors.isEmpty()) {
    return res
      //Returning data error status
      .status(422)
      //Returning a JSON message with the errors
      .json({
        message: "Validation failed, data inserted was incorrect.",
        errors: errors.array(),
      });
  }
  const title = req.body.title;
  const content = req.body.content;

  //Creating a mongodb document
  const post = new Post({
    title: title,
    content: content,
    creator: {
      name: "Conrado",
    },
    imageUrl: "/images/livros.jpg",
  })

  // Create post in DB
  post.save().then(result => {
    res.status(201).json({
      message: "Post create successfully",
      post: result,
    });

  }).catch(err => console.log(err))
  
};

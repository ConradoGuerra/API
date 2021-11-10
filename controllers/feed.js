//Importing the result of validation route
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");

//Importing the post model
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page;
  const perPage = 2;
  let totalItems;
  //Finding the posts
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      //Sending a response to client as JSON format
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  //Assining the validationResult to a variable
  const errors = validationResult(req);
  //If an error exists
  if (!errors.isEmpty()) {
    //Error handling, creating the message and statusCode
    const error = new Error("Validation failed, data inserted was incorrect.");
    error.statusCode = 422;
    //Throwing the error to the first middleware to catch it
    throw error;
  }
  //If the file doesnt exist
  if (!req.file) {
    const error = new Error("File doesnt exists.");
    error.statusCode = 422;
    throw error;
  }
  //Extracting the file path with multer
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  //Creating a mongodb document
  const post = new Post({
    title: title,
    content: content,
    creator: req.userId,
    imageUrl: imageUrl,
  });
  // Create post in DB
  post
    .save()
    .then((result) => {
      //With the post created, i will find the user and add the post to that user
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: {
          _id: creator._id,
          name: creator.name
        }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Getting the detailed post
exports.getPost = (req, res, next) => {
  //Requesting the parameter from body
  const postId = req.params.postId;
  //Searching for the post in mongodb
  Post.findById(postId)
    .then((post) => {
      //If the post was not found
      if (!post) {
        const error = new Error("Post not found!");
        error.statusCode = 404;
        //When we throw an error inside of a then block, then the error will be catched in the next catch error block
        throw error;
      }
      post.imageUrl = "http://localhost:8080/" + post.imageUrl;
      res.status(200).json({ message: "Detailed post fetched", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  //Assining the validationResult to a variable
  const errors = validationResult(req);
  //If an error exists
  if (!errors.isEmpty()) {
    //Error handling, creating the message and statusCode
    const error = new Error("Validation failed, data inserted was incorrect.");
    error.statusCode = 422;
    //Throwing the error to the first middleware to catch it
    throw error;
  }
  //Assingning variables received from user
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  //If the user selected a file, then the imageUrl will be overwrited by the file
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file selected.");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      //If the post was not found
      if (!post) {
        const error = new Error("Post not found!");
        error.statusCode = 404;
        //When we throw an error inside of a then block, then the error will be catched in the next catch error block
        throw error;
      }
      //If the url inputed from user is different from the one is saved in db, then the saved one will be deleted
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      //If the post was not found
      if (!post) {
        const error = new Error("Post not found!");
        error.statusCode = 404;
        //When we throw an error inside of a then block, then the error will be catched in the next catch error block
        throw error;
      }
      //Deleting the file from server
      clearImage(post.imageUrl);
      //Returning the method to delete the post from mongodb
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      //Sending the result to front
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Function to remove a file
const clearImage = (filePath) => {
  //Assigning the path of image
  filePath = path.join(__dirname, "..", filePath);
  //Deleting the image
  fs.unlink(filePath, (err) => console.log(err));
};

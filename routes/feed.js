const express = require("express");

const { body } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

//The route and the function that should be executed for the route
//GET /feed/posts
router.get("/posts", feedController.getPosts);

//POST /feed/post
router.post(
  "/post",
  //Creating a validation array to post route
  [
    //The title without spaces and minimum length of 5 characters
    body("title").trim().isLength({ min: 5 }),
    //The body without extra spaces and minimum length of 5 characters
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.postPosts
);

module.exports = router;

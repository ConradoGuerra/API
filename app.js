const express = require("express");

const feedRoutes = require("./routes/feed");

//Importing mongoose to create a model
const mongoose = require("mongoose");

const app = express();

// app.use(express.urlencoded()) // x-www-form-urlencoded <form>
app.use(express.json()); //application/json

//Setting especial headers to avoid CORS error
app.use((req, res, next) => {
  //Adding a specified header to response, allow any browser to access the header of the server
  res.setHeader("Access-Control-Allow-Origin", "*");
  //Allow the origins to use the specific http methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//Using and fowarding any incoming request of feed
app.use("/feed", feedRoutes);

//Connecting to mongoose and creating a messages db
mongoose.connect(
  "mongodb+srv://conrado:262800@cluster0.gpslw.mongodb.net/messages"
).then(result => {
    app.listen(8080);
}).catch(err => console.log(err));


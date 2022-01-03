const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../models/user");
const AuthController = require("../controllers/auth");
const mongoose = require("mongoose");

describe("Auth Controller - Login", function () {
  //Before the test begin, we create a user
  before(function(done) {
    //connecting to the fake database
    mongoose
      .connect(
        "mongodb+srv://conrado:262800@cluster0.gpslw.mongodb.net/test-messages"
      )
      //With the result of the connection estabilished we create an user
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "12435",
          name: "Test",
          posts: [],
          _id: "61a0c35872c66021d87a70ea",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  it("should throw an error with code 500 when try to access the database", function (done) {
    //Stubbing the findOne method of database
    sinon.stub(User, "findOne");

    //Throwing the error
    User.findOne.throws();

    //Creating the fake request
    const req = {
      body: {
        email: "test@tes.com",
        password: "test",
      },
    };

    //Calling the function, as the function is a promise, then we need to include the then block with the result
    AuthController.login(req, {}, () => {}).then((result) => {
      //We expect an error from the function
      expect(result).to.be.an("error");
      //and we excect tje 500 statusCode from this error
      expect(result).to.have.property("statusCode", 500);
      //Mocha have to wait until this function is done
      done();
    });

    //Restoring the findOne function
    User.findOne.restore();
  });
});

describe("Auth Controller - User Status", function () {
  it("should retrieve the user status from database", function (done) {
    //After save the user in fake db, we pass to our req and res the data that are similar of the function
    const req = { userId: "61a0c35872c66021d87a70ea" };
    const res = {
      statusCode: 500,
      userStatus: null,
      //The status function
      status: function (code) {
        console.log(code);
        this.statusCode = code;
        return this;
      },
      //The json function
      json: function (data) {
        console.log(data);
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new!");
      done()
    });
  });
  after(function(done){
    //Cleaning the users from test db
    User.deleteMany({})
      .then(() => {
        //Disconnecting the mongoose
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });

  })
});

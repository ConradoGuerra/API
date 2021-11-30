//Importing chai
const expect = require("chai").expect;

//Impoting the auth middleware function
const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", function () {
  //Describe the test
  it("should throw an error when the authorization header is missing", function () {
    //Now I will copy a result of a request handler
    //The request should bring in auth middleware a get result with 'Authorization' and We will bring a null
    const req = {
      get: function () {
        return null;
      },
    };

    //The bind element serves to chai simulate the call of authMiddleware function
    //then we pass this as first argument and the (req, res, next) as "second" argument
    //We want to throw an error, so we call to.throw then exactly the error that is found in the original funcion
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated!"
    );
  });

  it("it should thrown an error if isAuthorized has only one string", function () {
    const req = {
      get: function () {
        return "abc";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});

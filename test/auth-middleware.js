//Importing chai
const expect = require("chai").expect;
const sinon = require('sinon')
const jwt = require('jsonwebtoken')

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

  it('it should yield a userid after decoding the token', function(){
    const req = {
      get: function(){
        return 'Bearer abc'
      }
    }

    //As we are testing the jwt.verify method, we have to require it and test with sinon
    //So we stub the object jwt, method verify
    sinon.stub(jwt, 'verify')
    //Then it will return a userid, like middleware "is-auth.js"
    jwt.verify.returns({userId: 'test'})
    //Now we use the middleware
    authMiddleware(req, {}, ()=>{})
    //We expect the require to have a property userId, as the original middleware
    expect(req).to.have.property('userId')
    //Verifying if the function verify was called
    expect(jwt.verify.called).to.be.true
    //Restoring the jwt.verify to original functionality
    jwt.verify.restore()

  })
});

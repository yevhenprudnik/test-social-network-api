const userService = require('../services/user-service')
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
  
// -------------------------------- Registration -------------------------------- //

  async register(req, res, next) {
    try {
          const errors = validationResult(req)
          if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Validation failed, username and password length must be at least 5 characters each', errors.array()))
          }
          const { email, password, username } = req.body;
          const userData = await userService.register(email, password, username)

          return res.json(userData);
    } catch (error) {
      next(error)
    }
  }

// -------------------------------- Signing in -------------------------------- //

  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.signIn(email, password);

      return res.json(userData);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Auth ----------------------------- //

  async auth(req, res, next) {
    try {
        const userData = req.user
        const additionalData = await userService.getUserData(userData.id);
        res.json({userData, additionalData});
    } catch (error) {
      next(error)
    }
  }

// -------------------------------- Refresh Token -------------------------------- //

    async refresh(req, res, next) {
      try {
        const authorizationHeader = req.headers.authorization;
        
        if (!authorizationHeader){
          //console.log('no headers')
          return next(ApiError.UnauthorizedError());
        }
        const refreshToken = authorizationHeader.split(" ")[2];
        if (!refreshToken){
          //console.log('no token')
          return next(ApiError.UnauthorizedError());
        }
        const userData = await userService.refresh(refreshToken);
        return res.json(userData); 
      } catch (error) {
        next(error)
      }
    }

// -------------------------------- Email Confirmation -------------------------------- //

  async confirmEmail(req, res, next) {
    try {
        const activationLink = req.params.link;
        await userService.confirmEmail(activationLink);
        
        //return res.redirect(process.env.CLIENT_URL);
        return res.json('confirmed');
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new UserController();
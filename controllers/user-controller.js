const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
  
// -------------------------------- Registration -------------------------------- //

  async register(req, res, next) {
    try {
          const errors = validationResult(req);
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

  // -------------------------------- Signing out -------------------------------- //

  async signOut(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await tokenService.removeToken(userId);

      return res.json(data);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Auth ----------------------------- //

  async auth(req, res, next) {
    try {
        const userData = req.user
        const additionalData = await userService.getUserData(userData.id); //additional data for client
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

// ------------------------------ Get User -------------------------------- //

  async getUser(req, res, next) {
    try {
        const user = await userService.getUserData(req.query.id)
        res.json(user)
        
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

// ------------------------------ Follow -------------------------------- //

  async follow(req, res, next) {
    try {
      const { userToFollow } = req.body;
      const userId = req.user.id;
      const user = await userService.follow(userId, userToFollow);
      
      return res.json(user);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Unfollow -------------------------------- //

  async unfollow(req, res, next) {
    try {
      const { userToUnfollow } = req.body;
      const userId = req.user.id;
      const user = await userService.unfollow(userId, userToUnfollow);
      
      return res.json(user);
    } catch (error) {
      next(error)
    }
  }

}

module.exports = new UserController();
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
          const { email, password, username, fullName } = req.body;
          const userData = await userService.register(email, password, username, fullName);
      
          res.cookie('refreshToken', userData.refreshToken, { maxAge: 30*24*60*60*1000, httpOnly: true, secure : true });
          return res.json({accessToken: userData.accessToken, userId : userData.userId}); 
    } catch (error) {
      next(error)
    }
  }

// -------------------------------- Signing in -------------------------------- //

  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.signIn(email, password);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30*24*60*60*1000, httpOnly: true, secure : true });
      return res.json({accessToken: userData.accessToken, userId : userData.userId}); 
    } catch (error) {
      next(error)
    }
  }

  // -------------------------------- Signing out -------------------------------- //

  async signOut(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await tokenService.removeToken(userId);

      return res.json({signedOut : data.acknowledged});
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Auth ----------------------------- //

  async auth(req, res, next) {
    try {
        const userData = req.user
        const additionalData = await userService.getFullUserData(userData.id); //additional data for the client
        res.json({ userId: userData.id, additionalData });
    } catch (error) {
      next(error)
    }
  }

// -------------------------------- Refresh Token -------------------------------- //

    async refresh(req, res, next) {
      try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken){
          //console.log('no token')
          return next(ApiError.UnauthorizedError());
        }
        const userData = await userService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30*24*60*60*1000, httpOnly: true, secure : true });
        return res.json({accessToken: userData.accessToken, userId : userData.userId}); 
      } catch (error) {
        next(error)
      }
    }

// ------------------------------ Get User -------------------------------- //

  async getUser(req, res, next) {
    try {
        const userId = req.user.id;
        const userToFind = req.query.user;
        const user = await userService.getUserData(userId, userToFind);

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
        //return res.redirect(client url);
        return res.json('confirmed');
    } catch (error) {
      next(error);
    }
  }

// ------------------------------ Send friend request -------------------------------- //

  async sendRequest(req, res, next) {
    try {
      const { requestFriend } = req.body;
      const userId = req.user.id;
      const outcomingRequests = await userService.sendRequest(userId, requestFriend);
      
      return res.json(outcomingRequests);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Accept friend request --------------------------------- //

  async acceptRequest(req, res, next) {
    try {
      const { acceptFriend } = req.body;
      const userId = req.user.id;
      const userFriends = await userService.acceptRequest(userId, acceptFriend);
      
      return res.json(userFriends);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Reject friend request --------------------------------- //

  async rejectRequest(req, res, next) {
    try {
      const { rejectFriend } = req.body;
      const userId = req.user.id;
      const userFriends = await userService.rejectRequest(userId, rejectFriend);
      
      return res.json(userFriends);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Delete friend --------------------------------- //

  async deleteFriend(req, res, next) {
    try {
      const { deleteFriend } = req.body;
      const userId = req.user.id;
      const userFriends = await userService.deleteFriend(userId, deleteFriend);
      
      return res.json(userFriends);
    } catch (error) {
      next(error)
    }
  }

// ------------------------------ Change Avatar -------------------------------- //
  
  async changeAvatar(req, res, next) {
    try {
      const { newAvatar } = req.body;
      const userId = req.user.id;
      const userAvatar = await userService.changeAvatar(userId, newAvatar);
      
      return res.json(userAvatar);
    } catch (error) {
      next(error)
    }
  }

}

module.exports = new UserController();
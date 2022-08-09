const userService = require('../services/user-service')
const { validationResult } = require('express-validator');

class UserController {
  
// -------------------------------- Registration -------------------------------- //

  async register(req, res) {
    try {
          const errors = validationResult(req)
          if (!errors.isEmpty()) {
              return res.json({ 
              message : "Validation failed, username and password length must be at least 5 characters each!", 
              errors :errors.array() 
            });
          }
          const { email, password, username } = req.body;
          const userData = await userService.register(email, password, username)

          return res.json(userData);
    } catch (error) {
      res.json(error.message);
    }
  }

// -------------------------------- Signing in -------------------------------- //

  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const userData = await userService.signIn(email, password);

      return res.json(userData);
    } catch (error) {
      res.json(error.message);
    }
  }

// ------------------------------ Auth ----------------------------- //

  async auth(req, res) {
    try {
        const userData = req.user
        const additionalData = await userService.getUserData(userData.id);
        res.json({userData, additionalData});
    } catch (error) {
      res.json(error.message);
    }
  }

// -------------------------------- Refresh Token -------------------------------- //

    async refresh(req, res) {
      try {
        const authorizationHeader = req.headers.authorization;
        
        if (!authorizationHeader){
          //console.log('no headers')
          throw Error('Unauthorized user');
        }
        const refreshToken = authorizationHeader.split(" ")[2];
        if (!refreshToken){
          //console.log('no token')
          throw Error('Unauthorized user');
        }
        const userData = await userService.refresh(refreshToken);
        return res.json(userData); 
      } catch (error) {
        res.json(error.message);
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
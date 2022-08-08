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

}

module.exports = new UserController();
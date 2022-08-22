const ApiError = require('../exceptions/api-error');
const tokenModel = require('../models/token-model');
const oauthService = require('../services/oauth-service')

class OAuthController {

  async onSuccess(req, res, next) {
    try {
      const userId = req.user._id;
      const token = await tokenModel.findOne({ user : userId });
      res.cookie('refreshToken', token.refreshToken, { maxAge: 30*24*60*60*1000, httpOnly: true, secure : true });
      const accessToken = req.user.token;
      res.json({ userId, accessToken });
    } catch (error) {
      next(ApiError.BadRequest('Authorization failed'));
    }
  }

  async onFail(req, res, next) { return next(ApiError.BadRequest('Authorization failed')) }

  async auth(accessToken, refreshToken, profile, next) {
    try {
      const user = await oauthService(profile);
      
      return next(null, user);
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new OAuthController();
const ApiError = require('../exceptions/api-error');
const tokenModel = require('../models/token-model');

class OAuth {

  async onSuccess(req, res, next) {
    try {
      const userId = req.user._id;
      const token = await tokenModel.findOne({ user : userId });
      res.cookie('refreshToken', token.refreshToken, { maxAge: 30*24*60*60*1000, httpOnly: true });
      const accessToken = req.user.token;
      res.json({ userId, accessToken });
    } catch (error) {
      next(error);
    }
  }

  async onFail(req, res, next) {
    return next(ApiError.UnauthorizedError());
  }

}

module.exports = new OAuth();
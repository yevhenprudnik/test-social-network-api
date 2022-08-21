const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/token-service");

module.exports = async (req, res, next) => {
  try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader){
        //console.log('no headers')
        return next(ApiError.UnauthorizedError());
      }

      const accessToken = authorizationHeader.split(" ")[1];
      if (!accessToken){
        //console.log('no token')
        return next(ApiError.UnauthorizedError());
      }
      const userData = await tokenService.validateAccessToken(accessToken);
      if (!userData){
        //console.log('validation failed');
        return next(ApiError.UnauthorizedError());
      }
      req.user = userData;
      next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}
const tokenService = require("../services/token-service");

module.exports = async (req, res, next) => {
  try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader){
        //console.log('no headers')
        throw Error('Unauthorized user');
      }
      const accessToken = authorizationHeader.split(" ")[1];
      if (!accessToken){
        //console.log('no token')
        throw Error('Unauthorized user');
      }
      const userData = await tokenService.validateAccessToken(accessToken);
      if (!userData){
        //console.log('validation failed');
        throw Error('Unauthorized user');
      }
      req.user = userData;
      next();
  } catch (error) {
    res.json(error.message);
  }
}
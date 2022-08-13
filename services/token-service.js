const jwt  = require('jsonwebtoken');
const userModel = require('../models/user-model');
const tokenModel = require('../models/token-model');

class TokenService {
  
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_ACCESS, { expiresIn: '10h' }); // CHANGE TO 30m !!!!!
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, { expiresIn: '30d' });
    return { 
      accessToken,
      refreshToken
    };
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId });
    if (tokenData){
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async validateAccessToken(token) {
    try {
      const user = await userModel.findOne({token});
      if(!user){
        return null;
      }
      const userData = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_SECRET_REFRESH);
      return userData;
    } catch (error) {
      return null;
    }
  }

  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken: refreshToken });
    return tokenData;
  }

  async removeToken(userId) {
    const tokenData = await tokenModel.deleteOne({ userId });
    const user = await userModel.findById(userId);
    user.token = null;
    await user.save();

    return tokenData;
  }

}

module.exports = new TokenService();
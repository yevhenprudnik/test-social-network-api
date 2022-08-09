const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const UserDto = require('../dto/user-dto')
const tokenService = require('./token-service')

class UserService {

  // -------------------------------- Registration -------------------------------- //
  
  async register(email, password, username) {
    const candidate = await UserModel.findOne({ email }); // Check if user is already registered
    if (candidate) {
      throw Error('user is already registered');
    }
    const hashPassword = await bcrypt.hash(password, 3);

    const user = await UserModel.create({ email, username, password: hashPassword});

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto}); // without class
    user.token = tokens.accessToken

    await user.save()
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }
  
  // -------------------------------- Signing in -------------------------------- //

  async signIn(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) {
        throw Error('user already exists');
    }
    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      throw Error('wrong credentials');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    user.token = tokens.accessToken;
    await user.save();
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  // -------------------------------- Refresh Token -------------------------------- //

  async refresh(refreshToken) {
    if (!refreshToken) {
        //console.log('no token')
        throw Error('Unauthorized user');
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!tokenFromDb || !userData) {
      //console.log('wrong token')
      throw Error('Unauthorized user');
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    
    const tokens = tokenService.generateTokens({...userDto});
    user.token = tokens.accessToken;

    await user.save();
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  
}

module.exports = new UserService();
const UserDto = require('../dto/user-dto');
const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const mailService = require('./mail-service');
const uuid = require('uuid');
class UserService {

  // -------------------------------- Registration -------------------------------- //
  
  async register(email, password, username) {
    const candidateByEmail = await UserModel.findOne({ email }); // Check if user is already registered
    if (candidateByEmail) {
      throw ApiError.BadRequest(`User ${email} is already registered`)
    }
    const candidateByUsername = await UserModel.findOne({ username });
    if (candidateByUsername) {
      throw ApiError.BadRequest(`User ${username} is already registered`)
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const emailConfirmationLink = uuid.v4();

    const user = await UserModel.create({ email, username, password: hashPassword, emailConfirmationLink, memberSince: new Date() });
    await mailService.sendActionMail(email, `${process.env.API_URL}/api/confirmEmail/${emailConfirmationLink}`);

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
      throw ApiError.BadRequest('User is not found');
    }
    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      throw ApiError.BadRequest('Wrong credentials');
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
        throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!tokenFromDb || !userData) {
      //console.log('wrong token')
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    
    const tokens = tokenService.generateTokens({...userDto});
    user.token = tokens.accessToken;

    await user.save();
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  // -------------------------------- Email Confirmation -------------------------------- //

  async confirmEmail(emailConfirmationLink) {
    const user = await UserModel.findOne({ emailConfirmationLink })
    if (!user) {
      throw ApiError.BadRequest('Invalid activation link');
    }
    user.confirmedEmail = true;
    await user.save();
  }

// ------------------------------ Additional Data ------------------------------ //

  async getUserData(userId){
    const user = await UserModel.findById(userId).select('confirmedEmail username email');
    if (!user) {
      throw ApiError.BadRequest('User is not found')
    }
    return user;
  }
  
// ----------------------------- Follow ----------------------------------- //

  async follow(userId, userToFollowId){
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User is not found');
    }
    if (user.following.includes(userToFollowId)) {
      throw ApiError.BadRequest('You are already following this user');
    }
    user.following.push(userToFollowId);
    await user.save();

    const userToFollow = await UserModel.findById(userToFollowId);
    userToFollow.followers.push(userId);

    await userToFollow.save();
    return user.following;
  }
  
// ----------------------------- Unfollow ----------------------------------- //
  
  async unfollow(userId, userToUnfollowId){
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User is not found');
    }
    const following = user.following;
    const userIndex = following.indexOf(userToUnfollowId);
    if (userIndex < 0) {
      throw ApiError.BadRequest('You are not following this user');
    }

    user.following.splice(userIndex, 1);
    await user.save();

    const userToUnfollow = await UserModel.findById(userToUnfollowId);
    const userToUnfollowIndex = userToUnfollow.followers.indexOf(userId);
    userToUnfollow.followers.splice(userToUnfollowIndex, 1);
    
    await userToUnfollow.save();
    return user.following;
  }
  
}

module.exports = new UserService();
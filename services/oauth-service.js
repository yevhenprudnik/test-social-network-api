const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
  /**
   * @param profile
   *   Profile information from Google or Facebook account
   */
module.exports = async function(profile){
  const user = await UserModel.findOne({ oauthId: profile.id });
  if(user){
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});
    user.token = tokens.accessToken;
    await user.save();

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
    return user;
  } else {
      const username = profile.displayName.toLocaleLowerCase().replace(/\s/g, '');
      const candidateByUsername = await UserModel.findOne({ username });
      if (candidateByUsername){
        throw ApiError.BadRequest(`Looks like username ${username} is already taken, please try common method of registration and come up with different username`);
      }
      const emailConfirmationLink = uuid.v4();
      const user = await UserModel.create({ 
      email : profile.emails[0].value, 
      username,
      fullName : profile.displayName, 
      emailConfirmationLink, 
      avatar : profile.photos[0].value,
      createdVia : profile.provider,
      oauthId : profile.id });
      
      await mailService.sendActivationMail(profile.emails[0].value, `${process.env.API_URL}/user/confirm-email/${emailConfirmationLink}`);
      
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      user.token = tokens.accessToken;

      await user.save();
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return user;
  }
}
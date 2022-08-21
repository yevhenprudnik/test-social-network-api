const UserDto = require('../dto/user-dto');
const FriendDto = require('../dto/friend-dto');
const StrangerDto = require('../dto/stranger-dto');
const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const mailService = require('./mail-service');
const uuid = require('uuid');
class UserService {

  // -------------------------------- Registration -------------------------------- //
  
  async register(email, password, username, fullName) {
    // TODO: optimize check
    const candidateByEmail = await UserModel.findOne({ email }); // Check if user is already registered
    if (candidateByEmail) {
      throw ApiError.Conflict(`User ${email} is already registered`);
    }
    const candidateByUsername = await UserModel.findOne({ username });
    if (candidateByUsername) {
      throw ApiError.Conflict(`User ${username} is already registered`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const emailConfirmationLink = uuid.v4();

    const user = await UserModel.create({ email, username, fullName, password: hashPassword, emailConfirmationLink, memberSince: new Date()});
    await mailService.sendActivationMail(email, `${process.env.API_URL}/user/confirm-email/${emailConfirmationLink}`);

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto}); // without class
    user.token = tokens.accessToken;

    await user.save();
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, userId: user._id };
  }
  
  // -------------------------------- Signing in -------------------------------- //

  async signIn(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.NotFound('User is not found');
    }
    if (!user.password) {
      throw ApiError.BadRequest(`You have been authorized via ${user.createdVia}`);
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

    return { ...tokens, userId: user._id };
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

    // TODO: what will happen with the old token?

    return { ...tokens, userId : user._id };
  }

  // -------------------------------- Email Confirmation -------------------------------- //

  async confirmEmail(emailConfirmationLink) {
    const user = await UserModel.findOne({ emailConfirmationLink });
    if (!user) {
      throw ApiError.BadRequest('Invalid activation link');
    }
    user.confirmedEmail = true;
    await user.save();
  }

// ------------------------------ Additional Data ------------------------------ //

  async getFullUserData(userId){
    const user = await UserModel.findById(userId)
    .select('confirmedEmail username fullName email avatar friends incomingRequests outcomingRequests memberSince');
    if (!user) {
      throw ApiError.NotFound('User is not found');
    }
    return user;
  }
  

// ------------------------------ Users Data ------------------------------ //

  async getUserData(userId, userToFind){
    const user = await UserModel.findById(userId);
    const users = await UserModel.find({ $or:[ { 'username' : userToFind}, { 'fullName' : userToFind } ]});
    const resultUsersArray = users.map(el => {
      if (user.friends.includes(el.username) || el.username === user.username) {
        return new FriendDto(el);
      } else {
        return new StrangerDto(el);
      }
    })
    return resultUsersArray;
  }

// ----------------------------- Send friend request ----------------------------------- //

  async sendRequest(userId, requestFriend){
    const user = await UserModel.findById(userId);
    const userToBeFriend = await UserModel.findOne({ username : requestFriend });
    if (!user || !userToBeFriend) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.friends.includes(requestFriend)) {
      throw ApiError.BadRequest(`You are already friends with ${requestFriend}`);
    }
    if (user.outcomingRequests.includes(requestFriend)) {
      throw ApiError.BadRequest(`You have already sent request to ${requestFriend}`);
    }
    user.outcomingRequests.push(requestFriend);
    await user.save();

    userToBeFriend.incomingRequests.push(user.username);

    await userToBeFriend.save();
    return user.outcomingRequests;
  }
  
// ----------------------------- Accept friend request ----------------------------------- //
  
  async acceptRequest(userId, acceptFriend){
    const user = await UserModel.findById(userId);
    const userToAccept = await UserModel.findOne({ username : acceptFriend });
    if (!user || !userToAccept) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.friends.includes(acceptFriend)) {
      throw ApiError.BadRequest(`You are already friends with ${acceptFriend}`);
    }
    const incomingRequests = user.incomingRequests;
    const userIndex = incomingRequests.indexOf(acceptFriend);
    if (userIndex < 0) {
      throw ApiError.BadRequest(`User ${acceptFriend} did not send you request`);
    }

    user.incomingRequests.splice(userIndex, 1);
    user.friends.push(acceptFriend);
    await user.save();

    const acceptFriendIndex = userToAccept.outcomingRequests.indexOf(user.username);
    userToAccept.outcomingRequests.splice(acceptFriendIndex, 1);
    userToAccept.friends.push(user.username);
    
    await userToAccept.save();
    return user.friends;
  }

// ----------------------------- Reject friend request ----------------------------------- //
  
  async rejectRequest(userId, rejectFriend){
    const user = await UserModel.findById(userId);
    const userToReject = await UserModel.findOne({ username : rejectFriend });
    if (!user || !userToReject) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.friends.includes(rejectFriend)) {
      throw ApiError.BadRequest(`You are already friends with ${rejectFriend}`);
    }
    const incomingRequests = user.incomingRequests;
    const userIndex = incomingRequests.indexOf(rejectFriend);
    if (userIndex < 0) {
      throw ApiError.BadRequest(`User ${rejectFriend} did not send you request`);
    }

    user.incomingRequests.splice(userIndex, 1);
    await user.save();

    const acceptFriendIndex = userToReject.outcomingRequests.indexOf(user.username);
    userToReject.outcomingRequests.splice(acceptFriendIndex, 1);
    
    await userToReject.save();
    return user.friends;
  }

// ----------------------------- Delete friend ----------------------------------- //
  
  async deleteFriend(userId, deleteFriend){
    const user = await UserModel.findById(userId);
    const userToDelete = await UserModel.findOne({ username : deleteFriend });
    if (!user || !userToDelete) {
      throw ApiError.NotFound('User is not found');
    }

    const friends = user.friends;
    const userIndex = friends.indexOf(deleteFriend);
    if (userIndex < 0) {
      throw ApiError.BadRequest(`You are not friends with ${deleteFriend}`);
    }

    user.friends.splice(userIndex, 1);
    await user.save();

    const deleteFriendIndex = userToDelete.friends.indexOf(user.username);
    userToDelete.friends.splice(deleteFriendIndex, 1);
    
    await userToDelete.save();
    return user.friends;
  }

// ----------------------------- Change Avatar ----------------------------------- //

  async changeAvatar(userId, newAvatar){
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.NotFound('User is not found');
    }
    user.avatar = newAvatar;
    await user.save();

    return user.avatar;
  }
  
}

module.exports = new UserService();
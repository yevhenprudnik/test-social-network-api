const UserDto = require('../dtos/user-dto');
const FriendDto = require('../dtos/friend-dto');
const StrangerDto = require('../dtos/stranger-dto');
const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const mailService = require('./mail-service');
const uuid = require('uuid');
class UserService {
  /**
   * @param email
   *   User email.
   * @param password
   *   User password.
   * @param username
   *   User username.
   * @param fullName
   *   User Full Name.
   */
  async register(email, password, username, fullName) {
    const candidate = await UserModel.findOne({ $or:[ { email }, { username } ]});
    if (candidate) {
      if (candidate.username === username && candidate.email !== email) {
      throw ApiError.Conflict(`Username ${username} is already taken, please try to come up with a different username`);
      } else {
        throw ApiError.Conflict(`User with email ${email} is already registered`);
      }
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const emailConfirmationLink = uuid.v4();

    const user = await UserModel.create({ email, username, fullName, password: hashPassword, emailConfirmationLink, memberSince: new Date()});
    await mailService.sendActivationMail(email, `${process.env.API_URL}/user/confirm-email/${emailConfirmationLink}`);

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});
    user.token = tokens.accessToken;

    await user.save();
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, userId: user._id };
  }
  
  async signIn(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.createdVia) {
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
  /**
   * @param refreshToken
   *   Refresh token(token to renew access token)
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!tokenFromDb || !userData) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    
    const tokens = tokenService.generateTokens({...userDto});
    user.token = tokens.accessToken;

    await user.save();
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, userId : user._id };
  }
  /**
   * @param emailConfirmationLink
   *   Email confirmation link(unique for each user)
   */
  async confirmEmail(emailConfirmationLink) {
    const user = await UserModel.findOne({ emailConfirmationLink });
    if (!user) {
      throw ApiError.BadRequest('Invalid activation link');
    }
    user.confirmedEmail = true;
    await user.save();
  }
  /**
   * @param userId
   *   User id
   */
  async getFullUserData(userId){
    const user = await UserModel.findById(userId)
    .select('confirmedEmail username fullName email avatar friends incomingRequests outcomingRequests memberSince');
    if (!user) {
      throw ApiError.NotFound('User is not found');
    }
    return user;
  }
  /**
   * @param userToFind
   *   Username or full name of a user to find
   */
  async getUserData(userId, userToFind){
    const user = await UserModel.findById(userId);
    const users = await UserModel.find({ $or:[ { 'username' : userToFind}, { 'fullName' : userToFind } ]});
    const resultUsersArray = users.map(userObj => {
      if (user.friends.some(friend => friend.username === userObj.username) || userObj.username === user.username) {
        return new FriendDto(userObj);
      } else {
        return new StrangerDto(userObj);
      }
    })
    return resultUsersArray;
  }
  /**
   * @param requestFriend
   *   Username of a user you want to be friends with
   */
  async sendRequest(userId, requestFriend){
    const user = await UserModel.findById(userId);
    if (user.username === requestFriend) {
      throw ApiError.BadRequest(`You can't send request to yourself`);
    }
    if (user.incomingRequests.includes(requestFriend)) {
      throw ApiError.BadRequest(`User ${requestFriend} have already sent you request, just accept it`);
    }
    const userToBeFriend = await UserModel.findOne({ username : requestFriend });
    if (!user || !userToBeFriend) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.friends.some(el => el.username === requestFriend)) {
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
  /**
   * @param acceptFriend
   *   Username of a user you want to accept request from.
   */
  async acceptRequest(userId, acceptFriend){
    const user = await UserModel.findById(userId);
    const userToAccept = await UserModel.findOne({ username : acceptFriend });
    if (!user || !userToAccept) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.friends.some(el => el.username === acceptFriend)) {
      throw ApiError.BadRequest(`You are already friends with ${acceptFriend}`);
    }
    const incomingRequests = user.incomingRequests;
    if (!incomingRequests.includes(acceptFriend)) {
      throw ApiError.BadRequest(`User ${acceptFriend} did not send you request`);
    }
    const userIndex = incomingRequests.indexOf(acceptFriend);
    user.incomingRequests.splice(userIndex, 1);
    user.friends.push({
      username: acceptFriend,
      friendSince: new Date(),
      additionalInfo: userToAccept._id
    });
    await user.save();

    const acceptFriendIndex = userToAccept.outcomingRequests.indexOf(user.username);
    userToAccept.outcomingRequests.splice(acceptFriendIndex, 1);
    userToAccept.friends.push({
      username: user.username,
      friendSince: new Date(),
      additionalInfo: user._id
    });
    
    await userToAccept.save();
    return user.friends;
  }
  /**
   * @param rejectFriend
   *   Username of a user you want to reject request from.
   */
  async rejectRequest(userId, rejectFriend){
    const user = await UserModel.findById(userId);
    const userToReject = await UserModel.findOne({ username : rejectFriend });
    if (!user || !userToReject) {
      throw ApiError.NotFound('User is not found');
    }
    if (user.friends.some(el => el.username === rejectFriend)) {
      throw ApiError.BadRequest(`You are already friends with ${rejectFriend}`);
    }
    const incomingRequests = user.incomingRequests;
    if (!incomingRequests.includes(rejectFriend)) {
      throw ApiError.BadRequest(`User ${rejectFriend} did not send you request`);
    }
    const userIndex = incomingRequests.indexOf(rejectFriend);
    user.incomingRequests.splice(userIndex, 1);
    await user.save();

    const acceptFriendIndex = userToReject.outcomingRequests.indexOf(user.username);
    userToReject.outcomingRequests.splice(acceptFriendIndex, 1);
    
    await userToReject.save();
    return user.friends;
  }
  /**
   * @param deleteFriend
   *   Username of a user you want to delete from friends list.
   */
  async deleteFriend(userId, deleteFriend){
    const user = await UserModel.findById(userId);
    const userToDelete = await UserModel.findOne({ username : deleteFriend });
    if (!user || !userToDelete) {
      throw ApiError.NotFound('User is not found');
    }
    const userFriend = user.friends.find(el => el.username === deleteFriend);
    if (!userFriend) {
      throw ApiError.BadRequest(`You are not friends with ${deleteFriend}`);
    }
    user.friends.pull(userFriend.id);
    await user.save();

    const friendFriend = userToDelete.friends.find(el => el.username === user.username);
    userToDelete.friends.pull(friendFriend.id);
    
    await userToDelete.save();
    return user.friends;
  }
  /**
   * @param newAvatar
   *   Link to a new avatar.
   */
  async changeAvatar(userId, newAvatar){
    const user = await UserModel.findById(userId);
    user.avatar = newAvatar;
    await user.save();

    return user.avatar;
  }
  /**
   * @param page
   *   Page of user list(starts from 0).
   */
  async getFriends(userId, page) {
    const skipFriends = 100*page;
    const userFriendsObj = await UserModel.findById(userId)
    .populate({ path: 'friends.additionalInfo', select: 'fullName email avatar'})
    .select('friends');
    const sortedByDate = userFriendsObj.friends
    .sort((objA, objB) => Number(objA.friendSince) - Number(objB.friendSince));
    const limitedFriendsArray = sortedByDate.slice(skipFriends, skipFriends+100);

    return limitedFriendsArray;
  }
  
}

module.exports = new UserService();
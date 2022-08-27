const UserDto = require('../dtos/user-dto');
const FriendDto = require('../dtos/friend-dto');
const StrangerDto = require('../dtos/stranger-dto');
const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');
const FriendModel = require('../models/friend-model');
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
    .select('confirmedEmail username fullName email avatar createdAt');
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
    const user = await UserModel.findOne({ $or:[ { 'username' : userToFind}, { 'fullName' : userToFind } ]});
    if(!user) {
      throw ApiError.NotFound('User is not found');
    }
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : user.id, status: 'accepted'},
      { receiverId: userId, requesterId : user.id, status: 'accepted' },
    ]}) 
    if (isFriend){
      return new FriendDto(user);
    }
    return new StrangerDto(user);
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
    const userToBeFriend = await UserModel.findOne({ username : requestFriend });
    if (!userToBeFriend) {
      throw ApiError.NotFound('User is not found');
    }
    const friend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : userToBeFriend.id},
      { receiverId: userId, requesterId : userToBeFriend.id},
    ]});
    if (friend && friend.status === 'accepted') {
      throw ApiError.BadRequest(`You are already friends with ${requestFriend}`);
    }
    if (friend && friend.receiverId == userId) {
      throw ApiError.BadRequest(`User ${requestFriend} have already sent you request, just accept it`);
    }
    if (friend && friend.requesterId == userId) {
      throw ApiError.BadRequest(`You have already sent request to ${requestFriend}`);
    }

    await FriendModel.create({
      receiverId : userToBeFriend.id,
      requesterId : user.id,
      status : 'pending'
    });

    return { message: `Request was sent to ${requestFriend}`}
  }
  /**
   * @param acceptFriend
   *   Username of a user you want to accept request from.
   */
  async acceptRequest(userId, acceptFriend){
    const userToAccept = await UserModel.findOne({ username : acceptFriend });
    const friend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : userToAccept.id},
      { receiverId: userId, requesterId : userToAccept.id},
    ]});
    if (!friend) {
      throw ApiError.BadRequest(`User ${acceptFriend} did not send you request`);
    }
    if (friend && friend.status == 'accepted') {
      throw ApiError.BadRequest(`You are already friends with ${acceptFriend}`);
    }

    friend.status = 'accepted';
    await friend.save();

    return { message: `Request from ${acceptFriend} was accepted` }
  }
  /**
   * @param rejectFriend
   *   Username of a user you want to reject request from.
   */
  async rejectRequest(userId, rejectFriend){
    const userToReject = await UserModel.findOne({ username : rejectFriend });
    const friend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : userToReject.id},
      { receiverId: userId, requesterId : userToReject.id},
    ]});

    if (!friend) {
      throw ApiError.BadRequest(`User ${rejectFriend} did not send you request`);
    }

    if (friend && friend.status === 'accepted') {
      throw ApiError.BadRequest(`You are already friends with ${rejectFriend}`);
    }

    await friend.delete();

    return { message: `Request from ${rejectFriend} was rejected` }
  }
  /**
   * @param deleteFriend
   *   Username of a user you want to delete from friends list.
   */
  async deleteFriend(userId, deleteFriend){
    const userToDelete = await UserModel.findOne({ username : deleteFriend });
    if (!userToDelete) {
      throw ApiError.NotFound('User is not found');
    }
    const friend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : userToDelete.id, status: 'accepted'},
      { receiverId: userId, requesterId : userToDelete.id, status: 'accepted'},
    ]});
    if (!friend) {
      throw ApiError.BadRequest(`You are not friends with ${deleteFriend}`);
    }
    await friend.delete();
    return { message: `${deleteFriend} was removed from your friends list` }
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
    const userFriendsObj = await FriendModel.find({$or: [
      { requesterId: userId},
      { receiverId: userId},
    ]})
    .sort({createdAt : -1})
    .skip(skipFriends)
    .limit(100)
    .populate('receiverId', 'username')
    .populate('requesterId', 'username');

    return userFriendsObj;
  }

  async getFriendRequests(userId, page) {
    const skipRequests = 100*page;
    const requests = await FriendModel.find({ 
      receiverId: userId, status : 'pending'
    })
    .sort({ createdAt : -1 })
    .skip(skipRequests)
    .limit(100)
    .populate('requesterId', 'username');

    return requests;
  }
  
}

module.exports = new UserService();
const userService = require('../services/user-service');

class FriendController {

  async sendRequest(req, res, next) {
    try {
      const requestFriend = req.params.user;
      const userId = req.user.id;
      const message = await userService.sendRequest(userId, requestFriend);
      
      return res.json(message);
    } catch (error) {
      next(error)
    }
  }

  async acceptRequest(req, res, next) {
    try {
      const acceptFriend = req.params.user;
      const userId = req.user.id;
      const message = await userService.acceptRequest(userId, acceptFriend);
      
      return res.json(message);
    } catch (error) {
      next(error)
    }
  }

  async rejectRequest(req, res, next) {
    try {
      const rejectFriend = req.params.user;
      const userId = req.user.id;
      const message = await userService.rejectRequest(userId, rejectFriend);
      
      return res.json(message);
    } catch (error) {
      next(error)
    }
  }

  async deleteFriend(req, res, next) {
    try {
      const deleteFriend = req.params.user;
      const userId = req.user.id;
      const message = await userService.deleteFriend(userId, deleteFriend);
      
      return res.json(message);
    } catch (error) {
      next(error)
    }
  }

  async getFriends(req, res, next) {
    try {
      const userId = req.user.id;
      const page = req.query.page || 0;
      const userFriends = await userService.getFriends(userId, page);

      return res.json(userFriends);
    } catch (error) {
      next(error)
    }
  }

  async getFriendRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const page = req.query.page || 0;
      const friendsRequests = await userService.getFriendRequests(userId, page);

      return res.json(friendsRequests);
    } catch (error) {
      next(error)
    }
  }

}

module.exports = new FriendController();
// TOOD: change folder's name to dtos

module.exports = class FriendDto {
  constructor(model) {
    this.username = model.username;
    this.fullName = model.fullName;
    this.email = model.email;
    this.friends = model.friends;
    this.avatar = model.avatar;
    this.memberSince = model.memberSince;
    this.id = model._id;
  }
}
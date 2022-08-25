module.exports = class FriendDto {
  constructor(model) {
    this.username = model.username;
    this.fullName = model.fullName;
    this.email = model.email;
    this.avatar = model.avatar;
    this.createdAt = model.createdAt;
    this.id = model._id;
  }
}
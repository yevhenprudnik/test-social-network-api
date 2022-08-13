module.exports = class StrangerDto {
  constructor(model) {
    this.username = model.username;
    this.fullName = model.fullName;
    this.avatar = model.avatar;
    this.id = model._id;
  }
}
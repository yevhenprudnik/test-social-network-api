module.exports = class UserDto {
  constructor(model) {
    this.username = model.username;
    this.email = model.email;
    this.id = model._id;
  }
}
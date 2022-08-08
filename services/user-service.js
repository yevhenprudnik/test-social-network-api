const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')

class UserService {

  // -------------------------------- Registration -------------------------------- //
  
  async register(email, password, username) {
    const candidate = await UserModel.findOne({ email }); // Check if user is already registered
    if (candidate) {
      throw Error('user is already registered');
    }
    const hashPassword = await bcrypt.hash(password, 3);

    const user = await UserModel.create({ email, username, password: hashPassword});
    
    return user;
  }
  
  // -------------------------------- Signing in -------------------------------- //

  async signIn(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) {
        throw Error('user already exists');
    }
    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      throw Error('wrong credentials');
    }
    
    return user;
  }

  
}

module.exports = new UserService();
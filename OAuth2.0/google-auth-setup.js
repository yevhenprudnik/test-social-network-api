const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const UserModel = require('../models/user-model');
const uuid = require('uuid');
const mailService = require('../services/mail-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dto/user-dto');


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id);
  done(null, user);
})

passport.use(new GoogleStrategy({
  clientID: '441570643799-csqlsascutcv57lr0t5578eic84v7ens.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: `${process.env.API_URL}/oauth/callback/google`
},
async function(accessToken, refreshToken, profile, done) {
  //console.log(profile);
  const user = await UserModel.findOne({ email: profile.emails[0].value});
  if(user){
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto}); // without class
    user.token = tokens.accessToken;
    await user.save();

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
    return done(null, user);
  } else {
      const emailConfirmationLink = uuid.v4();
      const user = await UserModel.create({ 
      email : profile.emails[0].value, 
      username : profile.displayName.toLocaleLowerCase().replace(/\s/g, ''), 
      fullName : profile.displayName, 
      emailConfirmationLink, 
      avatar : profile.photos[0].value,
      createdVia: 'google',
      memberSince: new Date()});

      await mailService.sendActionMail(profile.emails[0].value, `${process.env.API_URL}/api/confirm-email/${emailConfirmationLink}`);
      
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto}); // without class
      user.token = tokens.accessToken;

      await user.save();
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return done(null, user);
  }
}
));
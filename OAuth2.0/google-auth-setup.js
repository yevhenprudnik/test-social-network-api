const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ApiError = require('../exceptions/api-error');
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
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/oauth/callback/google`
},
async function(accessToken, refreshToken, profile, done) {
  try {
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
        const username = profile.displayName.toLocaleLowerCase().replace(/\s/g, '');
        const candidateByUsername = await UserModel.findOne({ username });
        if (candidateByUsername){
          throw ApiError.BadRequest(`Looks like username ${username} is already taken, please try common method of registration and come up with different username`);
        }
        const emailConfirmationLink = uuid.v4();
        const user = await UserModel.create({ 
        email : profile.emails[0].value, 
        username,
        fullName : profile.displayName, 
        emailConfirmationLink, 
        avatar : profile.photos[0].value,
        createdVia: 'google',
        memberSince: new Date()});

        // TODO: the same code in facebook auth setup (add function for that)


        await mailService.sendActivationMail(profile.emails[0].value, `${process.env.API_URL}/user/confirm-email/${emailConfirmationLink}`);
        
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto}); // without class
        user.token = tokens.accessToken;

        await user.save();
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return done(null, user);
    }
  } catch (error) {
    done(error);
  }
  
}
));
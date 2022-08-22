const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const UserModel = require('../models/user-model');
const AuthHandler = require('../controllers/oauth-controller');

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
}, AuthHandler.auth));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/oauth/callback/facebook`,
  profileFields: ['id', 'displayName', 'photos', 'emails']
}, AuthHandler.auth));
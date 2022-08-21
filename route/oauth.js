const Router = require('express').Router;
const oauthRouter = new Router(); // TODO: can be just router = new Route();
const passport = require('passport');
require('../OAuth2.0/google-auth-setup');
require('../OAuth2.0/facebook-auth-setup');
const OAuth = require('../OAuth2.0/OAuth');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// TODO: rename directory to routes
// TODO: rename file to oauth-route.js

oauthRouter.use( cookieParser() );
oauthRouter.use(session({
  secret: 'keyboard cat', // TODO: env
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

oauthRouter.use( passport.initialize() );
oauthRouter.use( passport.session() );

oauthRouter.get('/', (req, res) => {res.json("oauthRouter's working")});


oauthRouter.get('/fail', OAuth.onFail);
oauthRouter.get('/success', OAuth.onSuccess);
oauthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }),);
oauthRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email']}));

oauthRouter.get('/callback/google',  
passport.authenticate('google', { failureRedirect: '/oauth/fail' }),
(req, res) => { res.redirect('/oauth/success') });

oauthRouter.get('/callback/facebook',  
passport.authenticate('facebook', { failureRedirect: '/oauth/fail' }),
(req, res) => { res.redirect('/oauth/success') });

module.exports = oauthRouter;
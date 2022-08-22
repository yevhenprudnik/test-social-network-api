const Router = require('express').Router;
const router = new Router();
const passport = require('passport');
require('../OAuth2.0/oauth-setup');
const OAuthController = require('../controllers/oauth-controller');
const cookieParser = require('cookie-parser');
const session = require('express-session');

router.use( cookieParser() );
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

router.use( passport.initialize() );
router.use( passport.session() );

router.get('/', (req, res) => {res.json("oauthRouter's working")});
router.get('/fail', OAuthController.onFail);
router.get('/success', OAuthController.onSuccess);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }),);
router.get('/facebook', passport.authenticate('facebook', { scope: ['email']}));

router.get('/callback/google',  
passport.authenticate('google', { failureRedirect: '/oauth/fail' }),
(req, res) => { res.redirect('/oauth/success') });

router.get('/callback/facebook',  
passport.authenticate('facebook', { failureRedirect: '/oauth/fail' }),
(req, res) => { res.redirect('/oauth/success') });

module.exports = router;
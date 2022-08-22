const Router = require('express').Router;
const router = new Router();
const userController = require('../controllers/user-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/', (req, res) => {res.json("auth's working")});

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min: 5, max: 32}),
  body('username').isLength({min: 5, max: 32}),
  userController.register
);
router.post('/signIn',  userController.signIn);
router.get('/signOut', authMiddleware, userController.signOut);
router.get('/check-auth', authMiddleware, userController.auth);
router.get('/refresh', userController.refresh);
router.get('/confirm-email/:link', userController.confirmEmail);

module.exports = router;
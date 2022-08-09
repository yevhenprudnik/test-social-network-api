const Router = require('express').Router;
const router = new Router();
const userController = require('../controllers/user-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');


router.get('/', (req, res) => {res.json("router's working")});

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min: 5, max: 32}),
  body('username').isLength({min: 5, max: 32}),
  userController.register
);
router.post('/signIn', userController.signIn);
router.get('/auth', authMiddleware, userController.auth);
router.get('/refresh', userController.refresh);
router.get('/confirmEmail/:link', userController.confirmEmail);

module.exports = router;